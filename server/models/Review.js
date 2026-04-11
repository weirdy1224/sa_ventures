const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date,
}, { timestamps: true });

reviewSchema.index({ product: 1, status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
