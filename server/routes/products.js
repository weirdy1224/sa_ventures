const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { productUpload } = require('../middleware/upload');

router.get('/categories', ctrl.getCategories);
router.get('/', optionalAuth, ctrl.getProducts);
router.get('/:id', optionalAuth, ctrl.getProduct);
router.post('/', authenticate, requireRole('admin'), productUpload.array('images', 8), ctrl.createProduct);
router.patch('/:id', authenticate, requireRole('admin'), productUpload.array('images', 8), ctrl.updateProduct);
router.delete('/:id', authenticate, requireRole('admin'), ctrl.deleteProduct);

module.exports = router;
