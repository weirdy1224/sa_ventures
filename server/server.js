require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const path = require('path');

const connectDB = require('./config/db');
const { initPassport } = require('./config/passport');
const { startCronJobs } = require('./services/cronService');
const { initSocketHandlers } = require('./sockets/orderSocket');
const { rateLimiter, authLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const staffRoutes = require('./routes/staff');
const deliveryPersonRoutes = require('./routes/deliveryPersons');
const analyticsRoutes = require('./routes/analytics');
const couponRoutes = require('./routes/coupons');
const proxyContactRoutes = require('./routes/proxyContact');
const securityLogRoutes = require('./routes/securityLog');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
});
initSocketHandlers(io);
app.set('io', io);

// Connect DB
connectDB();

// Trust proxy (needed for rate-limit behind nginx)
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Sessions (for guest cart) – MongoStore only when DB is configured
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, secure: process.env.NODE_ENV === 'production' },
};
if (process.env.MONGO_URI) {
  sessionConfig.store = MongoStore.create({ mongoUrl: process.env.MONGO_URI });
}
app.use(session(sessionConfig));

// Passport
initPassport(app);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global rate limit
app.use('/api', rateLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/my-orders', orderRoutes);
app.use('/api/razorpay', paymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/delivery-persons', deliveryPersonRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/proxy-contact', proxyContactRoutes);
app.use('/api/security-log', securityLogRoutes);
app.use('/api/upload-photo', uploadRoutes);
app.use('/api/location', uploadRoutes);
app.use('/api/reports', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start cron jobs only after server binds

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  startCronJobs();
});

module.exports = { app, server };
