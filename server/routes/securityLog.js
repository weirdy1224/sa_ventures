const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', authenticate, requireRole('admin'), ctrl.getSecurityLog);

module.exports = router;
