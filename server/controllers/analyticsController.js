const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const SalesCache = require('../models/SalesCache');
const SecurityLog = require('../models/SecurityLog');
const Banner = require('../models/Banner');
const { generatePDF } = require('../utils/pdfGenerator');
const { generateCSV } = require('../utils/csvGenerator');

// GET /api/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { range = 'monthly' } = req.query;
    const now = new Date();
    let startDate;

    if (range === 'daily') startDate = new Date(now.setDate(now.getDate() - 30));
    else if (range === 'weekly') startDate = new Date(now.setDate(now.getDate() - 84));
    else startDate = new Date(now.setMonth(now.getMonth() - 12));

    const [revenueData, topProducts, newCustomers, orderStats] = await Promise.all([
      // Revenue over time
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $group: {
          _id: range === 'daily'
            ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            : range === 'weekly'
            ? { $dateToString: { format: '%Y-%W', date: '$createdAt' } }
            : { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      // Top 5 products
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
        { $unwind: '$products' },
        { $group: { _id: '$products.productId', name: { $first: '$products.name' }, sales: { $sum: '$products.quantity' }, revenue: { $sum: { $multiply: ['$products.priceAtPurchase', '$products.quantity'] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      // New customers
      User.countDocuments({ role: 'customer', createdAt: { $gte: startDate } }),
      // Overall order stats
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);

    res.json({ revenueData, topProducts, newCustomers, orderStats, totalRevenue, totalOrders });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/reports/export?format=pdf|csv&dateFrom=&dateTo=
exports.exportReport = async (req, res) => {
  try {
    const { format = 'csv', dateFrom, dateTo } = req.query;
    const filter = { paymentStatus: 'paid' };
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email')
      .sort('-createdAt')
      .lean();

    if (format === 'pdf') {
      const pdf = await generatePDF(orders, { title: 'Sales Report', dateFrom, dateTo });
      res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="report.pdf"' });
      pdf.pipe(res);
      pdf.end();
    } else {
      const csv = generateCSV(orders.map(o => ({
        'Order ID': o._id,
        Customer: o.customer?.name,
        Email: o.customer?.email,
        Amount: o.totalAmount,
        Status: o.status,
        'Payment Status': o.paymentStatus,
        Date: o.createdAt,
      })));
      res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="report.csv"' });
      res.send(csv);
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/banners
exports.getBanners = async (req, res) => {
  try {
    const all = req.query.all === 'true';
    const filter = all ? {} : { isActive: true };
    const banners = await Banner.find(filter).sort('sortOrder');
    res.json({ banners });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/banners
exports.createBanner = async (req, res) => {
  try {
    const { linkUrl, title, subtitle, isActive, sortOrder } = req.body;
    const imageUrl = req.file ? `/uploads/banners/${req.file.filename}` : req.body.imageUrl;
    const banner = await Banner.create({ imageUrl, linkUrl, title, subtitle, isActive: isActive !== 'false', sortOrder: Number(sortOrder) || 0 });
    res.status(201).json({ banner });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/banners/:id
exports.updateBanner = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.imageUrl = `/uploads/banners/${req.file.filename}`;
    const banner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ banner });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// DELETE /api/banners/:id
exports.deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/security-log
exports.getSecurityLog = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await SecurityLog.countDocuments();
    const logs = await SecurityLog.find()
      .populate('userId', 'name email')
      .sort('-timestamp')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ logs, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/location
exports.updateLocation = async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;
    // Emit to order room
    req.app.get('io')?.to(`order:${orderId}`).emit('delivery:location', { lat, lng, timestamp: new Date() });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// POST /api/upload-photo
exports.uploadPhoto = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });
    const photoUrl = `/uploads/delivery/${req.file.filename}`;
    const order = await Order.findByIdAndUpdate(orderId, { $push: { photos: photoUrl } }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ photoUrl, order });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
