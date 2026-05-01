const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quantity: { type: Number, required: true, min: 1 },
  priceAtPurchase: { type: Number, required: true },
  imageUrl: String,
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: String,
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  note: String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [orderItemSchema],
  status: {
    type: String,
    enum: ['packed', 'shipped', 'nearest_hub', 'yet_to_deliver', 'delivered'],
    default: 'packed',
    required: true,
    index: true,
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expectedDelivery: Date,
  razorpayOrderId: { type: String },
  razorpayPaymentId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    required: true,
  },
  razorpayRefundId: String,
  couponCode: String,
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  address: {
    label: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
  },
  photos: [String],
  statusHistory: [statusHistorySchema],
  notes: String,
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
