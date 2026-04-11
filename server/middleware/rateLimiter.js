const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: () => isDev, // disable in dev & test; active only in production
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
  skip: () => isDev,
});

module.exports = { rateLimiter, authLimiter };
