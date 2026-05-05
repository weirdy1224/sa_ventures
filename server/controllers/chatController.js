const Chat = require('../models/Chat');

// ── Customer: get (or create) their conversation ──────────────────────────────
exports.getOrCreateConversation = async (req, res) => {
  try {
    let chat = await Chat.findOne({ customer: req.user._id });
    if (!chat) {
      chat = await Chat.create({
        customer: req.user._id,
        customerName: req.user.name,
        messages: [],
      });
    }
    res.json({ conversation: chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Customer / Staff / Admin: get messages for a conversation ─────────────────
exports.getMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Conversation not found' });

    // Customer can only read their own
    if (req.user.role === 'customer' && chat.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Send a message (customer or staff/admin) ──────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Message text required' });

    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Conversation not found' });

    // Customer can only message in their own conversation
    if (req.user.role === 'customer' && chat.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const message = {
      senderId:   req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      text:       text.trim(),
      timestamp:  new Date(),
    };

    chat.messages.push(message);
    chat.lastMessage   = text.trim();
    chat.lastMessageAt = new Date();

    // Increment unread count if customer is sending
    if (req.user.role === 'customer') {
      chat.unreadByStaff += 1;
    }

    await chat.save();

    const savedMsg = chat.messages[chat.messages.length - 1];

    // Broadcast via Socket.IO (attached to app by server.js)
    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${chat._id}`).emit('chat:message', {
        conversationId: chat._id,
        message: savedMsg,
      });
      // Notify staff/admin rooms about new/updated conversation
      io.to('staff:queries').emit('chat:conversation_update', {
        conversationId: chat._id,
        customerName:   chat.customerName,
        lastMessage:    chat.lastMessage,
        lastMessageAt:  chat.lastMessageAt,
        unreadByStaff:  chat.unreadByStaff,
      });
    }

    res.json({ message: savedMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin / Staff: list all conversations ────────────────────────────────────
exports.listConversations = async (req, res) => {
  try {
    const conversations = await Chat.find()
      .select('customer customerName lastMessage lastMessageAt unreadByStaff status createdAt')
      .sort({ lastMessageAt: -1 });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin / Staff: mark conversation as read ─────────────────────────────────
exports.markRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ error: 'Conversation not found' });

    chat.unreadByStaff = 0;
    await chat.save();

    const io = req.app.get('io');
    if (io) {
      io.to('staff:queries').emit('chat:conversation_update', {
        conversationId: chat._id,
        unreadByStaff:  0,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
