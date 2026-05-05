const cron = require('node-cron');
const Product = require('../models/Product');
const ProxySession = require('../models/ProxySession');
const Order = require('../models/Order');
const SalesCache = require('../models/SalesCache');
const { sendLowStockAlert } = require('./emailService');

const startCronJobs = () => {
  // === Hourly: Low-stock check (stock < 5) ===
  cron.schedule('0 * * * *', async () => {
    try {
      const lowStock = await Product.find({ stock: { $lt: 5 }, isActive: true }).lean();
      if (lowStock.length > 0) {
        console.log(`[Cron] Low stock: ${lowStock.length} products`);
        await sendLowStockAlert(lowStock);
      }
    } catch (err) { console.error('[Cron] Low-stock check error:', err.message); }
  });

  // === Every 6 hours: ProxySession cleanup ===
  cron.schedule('0 */6 * * *', async () => {
    try {
      const now = new Date();
      const expired = await ProxySession.find({ expiresAt: { $lt: now } });
      if (expired.length > 0) {
        // Release Twilio sessions
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid') {
          const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          for (const session of expired) {
            try {
              await twilio.proxy.v1.services(process.env.TWILIO_PROXY_SERVICE_SID)
                .sessions(session.twilioSessionId).remove();
            } catch (_) {}
          }
        }
        await ProxySession.deleteMany({ expiresAt: { $lt: now } });
        console.log(`[Cron] Cleaned up ${expired.length} proxy sessions`);
      }
    } catch (err) { console.error('[Cron] Proxy cleanup error:', err.message); }
  });

  // === Midnight: Analytics aggregation cache ===
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ranges = ['daily', 'weekly', 'monthly'];

      for (const range of ranges) {
        let startDate;
        const now = new Date();
        if (range === 'daily') startDate = new Date(now.setDate(now.getDate() - 30));
        else if (range === 'weekly') startDate = new Date(now.setDate(now.getDate() - 84));
        else startDate = new Date(now.setMonth(now.getMonth() - 12));

        const [revenueData, topProducts] = await Promise.all([
          Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
            { $group: {
              _id: range === 'daily' ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                : range === 'weekly' ? { $dateToString: { format: '%Y-%W', date: '$createdAt' } }
                : { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 },
            }},
            { $sort: { _id: 1 } },
          ]),
          Order.aggregate([
            { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
            { $unwind: '$products' },
            { $group: { _id: '$products.productId', name: { $first: '$products.name' }, sales: { $sum: '$products.quantity' }, revenue: { $sum: { $multiply: ['$products.priceAtPurchase', '$products.quantity'] } } } },
            { $sort: { revenue: -1 } }, { $limit: 5 },
          ]),
        ]);

        await SalesCache.findOneAndUpdate(
          { date: today, range },
          { totalRevenue: revenueData.reduce((s, d) => s + d.revenue, 0), totalOrders: revenueData.reduce((s, d) => s + d.orders, 0), topProducts, revenueByDay: revenueData },
          { upsert: true }
        );
      }
      console.log('[Cron] Analytics cache updated');
    } catch (err) { console.error('[Cron] Analytics cache error:', err.message); }
  });

  console.log(' Cron jobs started');
};

module.exports = { startCronJobs };
