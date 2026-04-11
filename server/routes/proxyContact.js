const router = require('express').Router();
const ProxySession = require('../models/ProxySession');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// POST /api/proxy-contact
router.post('/', authenticate, requireRole('customer', 'staff'), async (req, res) => {
  try {
    const { orderId } = req.body;
    // Check for existing active session
    const existing = await ProxySession.findOne({ orderId, expiresAt: { $gt: new Date() } });
    if (existing) return res.json({ proxyNumber: existing.proxyNumber, sessionId: existing.twilioSessionId });

    // Check Twilio is configured
    if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid') {
      return res.status(503).json({ error: 'Twilio not configured. Please add credentials to .env' });
    }

    const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const session = await twilio.proxy.v1.services(process.env.TWILIO_PROXY_SERVICE_SID).sessions.create({
      uniqueName: `order_${orderId}_${Date.now()}`,
      ttl: 24 * 60 * 60, // 24 hours
    });

    const proxySession = await ProxySession.create({
      orderId,
      customerId: req.user._id,
      proxyNumber: session.proxyNumber || 'TBD',
      twilioSessionId: session.sid,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.json({ proxyNumber: proxySession.proxyNumber, sessionId: session.sid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
