const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, index: true },
  category: { type: String, required: true, index: true, trim: true },
  subcategory: String,
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  tags: [String],
  sku: { type: String, unique: true, sparse: true },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  isFeatured: { type: Boolean, default: false },
  discount: { type: Number, default: 0 }, // percentage
}, { timestamps: true });

// Text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for discounted price
productSchema.virtual('salePrice').get(function () {
  if (this.discount > 0) return Math.round(this.price * (1 - this.discount / 100));
  return this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
