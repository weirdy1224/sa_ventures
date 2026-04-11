const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', authenticate, requireRole('admin'), ctrl.getAnalytics);
router.get('/export', authenticate, requireRole('admin', 'staff'), ctrl.exportReport);

module.exports = router;
