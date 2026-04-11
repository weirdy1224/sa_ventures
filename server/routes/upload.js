const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { deliveryUpload } = require('../middleware/upload');

router.post('/photo', authenticate, requireRole('delivery'), deliveryUpload.single('photo'), ctrl.uploadPhoto);
router.post('/location', authenticate, requireRole('delivery'), ctrl.updateLocation);

module.exports = router;
