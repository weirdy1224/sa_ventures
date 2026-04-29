const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  maxUses: {
    type: Number,
    required: true,
    min: 1,
  },
  currentUses: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.currentUses >= this.maxUses) return false;
  if (new Date() > this.expiresAt) return false;
  return true;
};

module.exports = mongoose.model('Coupon', couponSchema);
