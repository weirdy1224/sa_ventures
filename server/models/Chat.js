const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['customer', 'admin', 'staff'], required: true },
  text:       { type: String, required: true, trim: true },
  timestamp:  { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // one conversation per customer
  },
  customerName: { type: String, required: true },
  messages:     [messageSchema],
  status:       { type: String, enum: ['open', 'closed'], default: 'open' },
  unreadByStaff: { type: Number, default: 0 }, // messages customer sent that staff hasn't seen
  lastMessage:  { type: String, default: '' },
  lastMessageAt:{ type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
