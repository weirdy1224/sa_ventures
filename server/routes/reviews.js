const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.post('/', authenticate, requireRole('customer'), ctrl.createReview);
router.get('/pending', authenticate, requireRole('admin', 'staff'), ctrl.getPendingReviews);
router.get('/:productId', ctrl.getProductReviews);
router.patch('/:id/approve', authenticate, requireRole('admin', 'staff'), ctrl.moderateReview);

module.exports = router;
