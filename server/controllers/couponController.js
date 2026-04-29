const Coupon = require('../models/Coupon');

// GET /api/coupons (Admin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ coupons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/coupons (Admin)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, maxUses, expiresAt } = req.body;
    if (!code || !discountPercentage || !maxUses || !expiresAt) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercentage,
      maxUses,
      expiresAt: new Date(expiresAt),
      isActive: true,
    });

    res.status(201).json({ coupon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/coupons/:id (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.code) updates.code = updates.code.toUpperCase();
    if (updates.expiresAt) updates.expiresAt = new Date(updates.expiresAt);

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ coupon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/coupons/:id (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/coupons/validate?code=XYZ (Customer/Public)
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ error: 'Invalid coupon code' });

    if (!coupon.isValid()) {
      if (!coupon.isActive) return res.status(400).json({ error: 'Coupon is disabled' });
      if (new Date() > coupon.expiresAt) return res.status(400).json({ error: 'Coupon has expired' });
      if (coupon.currentUses >= coupon.maxUses) return res.status(400).json({ error: 'Coupon usage limit reached' });
      return res.status(400).json({ error: 'Coupon is not valid' });
    }

    res.json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      code: coupon.code
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
