const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Webhook – no auth, uses signature verification
router.post('/webhook', express_raw, ctrl.webhook);
router.post('/verify', authenticate, ctrl.verifyPayment);
router.get('/', authenticate, requireRole('admin', 'staff'), ctrl.getPayments);
router.post('/refund/:orderId', authenticate, requireRole('staff', 'admin'), ctrl.refund);

// Need raw body for webhook signature verification
function express_raw(req, res, next) {
  const express = require('express');
  express.raw({ type: 'application/json' })(req, res, (err) => {
    if (err) return next(err);
    if (Buffer.isBuffer(req.body)) req.body = JSON.parse(req.body.toString());
    next();
  });
}

module.exports = router;
