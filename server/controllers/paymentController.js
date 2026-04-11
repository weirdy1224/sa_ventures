const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const { sendRefundEmail, sendOrderConfirmation } = require('../services/emailService');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/razorpay/webhook
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');

    if (signature !== expectedSig) return res.status(400).json({ error: 'Invalid webhook signature' });

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const order = await Order.findOne({ razorpayOrderId: payment.order_id }).populate('customer', 'email name');
      if (order) {
        order.razorpayPaymentId = payment.id;
        order.paymentStatus = 'paid';
        await order.save();
        await sendOrderConfirmation(order.customer, order);
        // Reduce stock
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
        }
        await Cart.findOneAndUpdate({ user: order.customer._id }, { items: [] });
      }
    } else if (event === 'payment.failed') {
      const payment = payload.payment.entity;
      await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        { paymentStatus: 'failed' }
      );
    }

    res.json({ status: 'ok' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Verify payment client-side (optional)
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const sig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    if (sig !== razorpaySignature) return res.status(400).json({ verified: false, error: 'Signature mismatch' });
    res.json({ verified: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.paymentStatus = status;
    const total = await Order.countDocuments(filter);
    const payments = await Order.find(filter)
      .select('customer razorpayOrderId razorpayPaymentId paymentStatus totalAmount createdAt')
      .populate('customer', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ payments, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/payments/refund/:orderId
exports.refund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('customer', 'email name');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.razorpayPaymentId) return res.status(400).json({ error: 'No payment to refund' });
    if (order.paymentStatus === 'refunded') return res.status(400).json({ error: 'Already refunded' });

    const rzp = getRazorpay();
    const refund = await rzp.payments.refund(order.razorpayPaymentId, {
      amount: Math.round(order.totalAmount * 100),
      speed: 'normal',
      notes: { orderId: order._id.toString() },
    });

    order.paymentStatus = 'refunded';
    order.razorpayRefundId = refund.id;
    await order.save();

    await sendRefundEmail(order.customer, order, refund);

    res.json({ message: 'Refund initiated', refund });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
