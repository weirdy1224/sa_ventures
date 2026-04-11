const mongoose = require('mongoose');

const proxySessionSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proxyNumber: { type: String, required: true },
  twilioSessionId: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
}, { timestamps: true });

module.exports = mongoose.model('ProxySession', proxySessionSchema);
