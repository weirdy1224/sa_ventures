const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SecurityLog = require('../models/SecurityLog');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

const logEvent = async (userId, role, event, req) => {
  try {
    await SecurityLog.create({
      userId,
      role,
      event,
      ip: req.ip || req.connection?.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
    });
  } catch (_) {}
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, role: 'customer' });
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    await logEvent(user._id, user.role, 'login', req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({ accessToken, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      await logEvent(user?._id || null, 'unknown', 'failed_login', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      await logEvent(user._id, user.role, 'failed_login', req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    await logEvent(user._id, user.role, 'login', req);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });
        await logEvent(user._id, user.role, 'logout', req);
      }
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user.toPublic() });
};

// PATCH /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, avatar, addresses } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (addresses) user.addresses = addresses;
    await user.save();
    res.json({ user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
