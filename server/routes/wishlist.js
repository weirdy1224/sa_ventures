const router = require('express').Router();
const ctrl = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, ctrl.getWishlist);
router.post('/', authenticate, ctrl.toggleWishlist);

module.exports = router;
