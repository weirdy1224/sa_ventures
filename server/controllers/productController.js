const Product = require('../models/Product');
const path = require('path');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12, sort = '-createdAt', featured } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (featured === 'true') filter.isFeatured = true;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      products,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({ path: 'reviews', match: { status: 'approved' }, populate: { path: 'customer', select: 'name avatar' } });
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, subcategory, tags, sku, discount, isFeatured } = req.body;
    const images = req.files?.map(f => `/uploads/products/${f.filename}`) || [];

    const product = await Product.create({
      name, description,
      price: Number(price),
      stock: Number(stock),
      category, subcategory, tags: tags ? JSON.parse(tags) : [],
      images, sku, discount: Number(discount) || 0,
      isFeatured: isFeatured === 'true',
    });
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.stock) updates.stock = Number(updates.stock);
    if (updates.discount) updates.discount = Number(updates.discount);
    if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
    if (req.files?.length) {
      updates.$push = { images: { $each: req.files.map(f => `/uploads/products/${f.filename}`) } };
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/products/:id (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deactivated', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
