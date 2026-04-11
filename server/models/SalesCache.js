const mongoose = require('mongoose');

const salesCacheSchema = new mongoose.Schema({
  date: { type: Date, required: true, index: true },
  range: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  totalRevenue: Number,
  totalOrders: Number,
  newCustomers: Number,
  topProducts: [{ productId: mongoose.Schema.Types.ObjectId, name: String, sales: Number, revenue: Number }],
  revenueByDay: [{ date: Date, revenue: Number, orders: Number }],
}, { timestamps: true });

salesCacheSchema.index({ date: 1, range: 1 }, { unique: true });

module.exports = mongoose.model('SalesCache', salesCacheSchema);
