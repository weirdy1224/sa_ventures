const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.get('/me', authenticate, ctrl.getMe);
router.patch('/me', authenticate, ctrl.updateMe);

// Google OAuth
const passport = require('passport');
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
  const jwt = require('jsonwebtoken');
  const accessToken = jwt.sign(
    { id: req.user._id, role: req.user.role, email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  res.redirect(`${process.env.CLIENT_URL}/auth/social?token=${accessToken}`);
});

module.exports = router;
