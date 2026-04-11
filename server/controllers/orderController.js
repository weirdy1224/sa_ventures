const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET /api/orders  (Admin/Staff)
exports.getOrders = async (req, res) => {
  try {
    const { status, dateFrom, dateTo, page = 1, limit = 20, customer } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ orders, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('products.productId', 'name images');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Customers can only view their own orders
    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ order });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const { cartId, addressId, couponCode } = req.body;

    // Get cart
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.productId');
    if (!cart?.items?.length) return res.status(400).json({ error: 'Cart is empty' });

    // Get address
    const user = req.user;
    const address = addressId
      ? user.addresses.id(addressId)
      : user.addresses.find(a => a.isDefault) || user.addresses[0];
    if (!address) return res.status(400).json({ error: 'No delivery address found' });

    // Calculate total
    let totalAmount = 0;
    const products = [];
    for (const item of cart.items) {
      const p = item.productId;
      if (!p || !p.isActive) return res.status(400).json({ error: `Product ${p?.name || 'unknown'} unavailable` });
      if (p.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${p.name}` });
      const price = p.salePrice || p.price;
      totalAmount += price * item.quantity;
      products.push({
        productId: p._id, name: p.name, quantity: item.quantity,
        priceAtPurchase: price, imageUrl: p.images[0],
      });
    }

    let discountAmount = 0;
    // TODO: coupon validation

    const finalAmount = Math.max(totalAmount - discountAmount, 0);

    // Create Razorpay order
    const razorpayInstance = getRazorpay();
    const rzpOrder = await razorpayInstance.orders.create({
      amount: Math.round(finalAmount * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // Create order in DB
    const order = await Order.create({
      customer: req.user._id,
      products,
      totalAmount: finalAmount,
      discountAmount,
      couponCode,
      razorpayOrderId: rzpOrder.id,
      paymentStatus: 'pending',
      address: { label: address.label, line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode },
      statusHistory: [{ status: 'packed', changedBy: req.user._id, changedAt: new Date() }],
    });

    res.status(201).json({ order, razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/orders/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['packed', 'shipped', 'nearest_hub', 'yet_to_deliver', 'delivered'];

    // Delivery persons can only use delivery-related statuses
    if (req.user.role === 'delivery' && !['shipped', 'nearest_hub', 'yet_to_deliver', 'delivered'].includes(status)) {
      return res.status(403).json({ error: 'Delivery role cannot set this status' });
    }
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id, changedAt: new Date(), note });
    await order.save();

    // Emit real-time update
    req.app.get('io')?.to(`order:${order._id}`).emit('order:status:update', { orderId: order._id, status, changedAt: new Date() });

    // Send email
    await sendOrderStatusUpdate(order.customer, order);

    // Reduce stock on delivery
    if (status === 'delivered') {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
      // Clear cart
      await Cart.findOneAndUpdate({ user: order.customer._id }, { items: [] });
    }

    res.json({ order });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/orders/:id/expected-delivery
exports.setExpectedDelivery = async (req, res) => {
  try {
    const { expectedDelivery } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { expectedDelivery }, { new: true }).populate('customer', 'email name');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await sendOrderStatusUpdate(order.customer, order);
    res.json({ order });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/orders/:id/assign-delivery/:userId
exports.assignDelivery = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.params.userId },
      { new: true }
    ).populate('assignedTo', 'name email');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/my-orders  (Delivery)
exports.getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { assignedTo: req.user._id };
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('customer', 'name phone')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ orders, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/orders/customer/mine  (Customer)
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort('-createdAt').populate('products.productId', 'name images');
    res.json({ orders });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
