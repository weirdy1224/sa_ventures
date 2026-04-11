const router = require('express').Router();
const ctrl = require('../controllers/cartController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, ctrl.getCart);
router.post('/', optionalAuth, ctrl.updateCart);
router.delete('/', optionalAuth, ctrl.clearCart);

module.exports = router;
