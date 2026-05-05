const Chat = require('../models/Chat');

const initChatSocket = (io) => {
  io.on('connection', (socket) => {
    // Customer or staff joins a specific conversation room
    socket.on('chat:join', ({ conversationId }) => {
      socket.join(`chat:${conversationId}`);
    });

    socket.on('chat:leave', ({ conversationId }) => {
      socket.leave(`chat:${conversationId}`);
    });

    // Admin/Staff join the global queries room (for live conversation list updates)
    socket.on('chat:join_staff', () => {
      socket.join('staff:queries');
    });

    socket.on('chat:leave_staff', () => {
      socket.leave('staff:queries');
    });

    // Typing indicator (optional UX enhancement)
    socket.on('chat:typing', ({ conversationId, senderName, isTyping }) => {
      socket.to(`chat:${conversationId}`).emit('chat:typing', { senderName, isTyping });
    });
  });
};

module.exports = { initChatSocket };
