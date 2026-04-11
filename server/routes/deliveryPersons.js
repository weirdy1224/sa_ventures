const router = require('express').Router();
const ctrl = require('../controllers/staffController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.post('/', authenticate, requireRole('admin', 'staff'), ctrl.createDeliveryPerson);
router.get('/', authenticate, requireRole('admin', 'staff'), ctrl.getDeliveryPersons);

module.exports = router;
