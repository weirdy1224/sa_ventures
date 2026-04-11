const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Verify customer purchased this product
    const hasPurchased = await Order.exists({
      customer: req.user._id,
      'products.productId': productId,
      status: 'delivered',
      paymentStatus: 'paid',
    });
    if (!hasPurchased) return res.status(403).json({ error: 'You can only review products you have purchased and received' });

    // Prevent duplicate reviews
    const existing = await Review.findOne({ product: productId, customer: req.user._id });
    if (existing) return res.status(409).json({ error: 'You have already reviewed this product' });

    const review = await Review.create({ product: productId, customer: req.user._id, rating, comment, status: 'pending' });
    res.status(201).json({ review, message: 'Review submitted for moderation' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/reviews/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
      .populate('customer', 'name avatar')
      .sort('-createdAt');
    res.json({ reviews });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/reviews/pending
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('customer', 'name email')
      .populate('product', 'name images')
      .sort('-createdAt');
    res.json({ reviews });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PATCH /api/reviews/:id/approve
exports.moderateReview = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status, moderatedBy: req.user._id, moderatedAt: new Date() },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Recalculate product average rating
    if (status === 'approved') {
      const approved = await Review.find({ product: review.product, status: 'approved' });
      const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
      await Product.findByIdAndUpdate(review.product, { averageRating: Math.round(avg * 10) / 10, reviewCount: approved.length });
    }

    res.json({ review });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
