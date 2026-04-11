const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  event: { type: String, enum: ['login', 'logout', 'failed_login', 'token_refresh'], required: true },
  ip: { type: String, required: true },
  userAgent: String,
  timestamp: { type: Date, default: Date.now, index: true },
});

securityLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
