const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { bannerUpload } = require('../middleware/upload');

router.get('/', ctrl.getBanners);
router.post('/', authenticate, requireRole('admin'), bannerUpload.single('image'), ctrl.createBanner);
router.patch('/:id', authenticate, requireRole('admin'), bannerUpload.single('image'), ctrl.updateBanner);
router.delete('/:id', authenticate, requireRole('admin'), ctrl.deleteBanner);

module.exports = router;
