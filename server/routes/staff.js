const router = require('express').Router();
const ctrl = require('../controllers/staffController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.post('/', authenticate, requireRole('admin'), ctrl.createStaff);
router.get('/', authenticate, requireRole('admin'), ctrl.getStaff);
router.delete('/:id', authenticate, requireRole('admin'), ctrl.deactivateStaff);

module.exports = router;
