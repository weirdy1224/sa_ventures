const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  linkUrl: String,
  title: String,
  subtitle: String,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
