const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Customer
router.post('/', authenticate, requireRole('customer'), ctrl.createOrder);
router.get('/customer/mine', authenticate, requireRole('customer'), ctrl.getCustomerOrders);

// Delivery person
router.get('/my', authenticate, requireRole('delivery'), ctrl.getMyOrders);

// Admin / Staff
router.get('/', authenticate, requireRole('admin', 'staff'), ctrl.getOrders);

// All roles
router.get('/:id', authenticate, ctrl.getOrder);
router.patch('/:id/status', authenticate, requireRole('admin', 'staff', 'delivery'), ctrl.updateStatus);
router.patch('/:id/expected-delivery', authenticate, requireRole('staff', 'admin'), ctrl.setExpectedDelivery);
router.patch('/:id/assign-delivery/:userId', authenticate, requireRole('staff', 'admin'), ctrl.assignDelivery);

module.exports = router;
