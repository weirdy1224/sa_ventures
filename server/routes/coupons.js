const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Public / Customer validation
router.get('/validate', authenticate, ctrl.validateCoupon);

// Admin routes
router.get('/', authenticate, requireRole('admin'), ctrl.getCoupons);
router.post('/', authenticate, requireRole('admin'), ctrl.createCoupon);
router.patch('/:id', authenticate, requireRole('admin'), ctrl.updateCoupon);
router.delete('/:id', authenticate, requireRole('admin'), ctrl.deleteCoupon);

module.exports = router;
