const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    if (req.user) {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.productId');
      return res.json({ cart: cart || { items: [] } });
    } else {
      // Guest: use session
      const sessionCart = req.session.cart || { items: [] };
      // Populate product data
      const productIds = sessionCart.items.map(i => i.productId);
      const products = await Product.find({ _id: { $in: productIds } }).lean();
      const productMap = Object.fromEntries(products.map(p => [p._id.toString(), p]));
      sessionCart.items = sessionCart.items.map(i => ({
        productId: productMap[i.productId] || i.productId,
        quantity: i.quantity,
      }));
      return res.json({ cart: sessionCart });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/cart  { productId, quantity, action: 'add'|'remove'|'set' }
exports.updateCart = async (req, res) => {
  try {
    const { productId, quantity = 1, action = 'add' } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId required' });

    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found' });

    if (req.user) {
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) cart = new Cart({ user: req.user._id, items: [] });

      const idx = cart.items.findIndex(i => i.productId.toString() === productId);
      if (action === 'add') {
        if (idx > -1) cart.items[idx].quantity += Number(quantity);
        else cart.items.push({ productId, quantity: Number(quantity) });
      } else if (action === 'remove') {
        if (idx > -1) {
          cart.items[idx].quantity -= Number(quantity);
          if (cart.items[idx].quantity <= 0) cart.items.splice(idx, 1);
        }
      } else if (action === 'set') {
        if (Number(quantity) <= 0) {
          if (idx > -1) cart.items.splice(idx, 1);
        } else {
          if (idx > -1) cart.items[idx].quantity = Number(quantity);
          else cart.items.push({ productId, quantity: Number(quantity) });
        }
      } else if (action === 'delete') {
        if (idx > -1) cart.items.splice(idx, 1);
      }

      await cart.save();
      await cart.populate('items.productId');
      return res.json({ cart });
    } else {
      if (!req.session.cart) req.session.cart = { items: [] };
      const items = req.session.cart.items;
      const idx = items.findIndex(i => i.productId === productId);
      if (action === 'add') {
        if (idx > -1) items[idx].quantity += Number(quantity);
        else items.push({ productId, quantity: Number(quantity) });
      } else if (action === 'remove') {
        if (idx > -1) { items[idx].quantity -= Number(quantity); if (items[idx].quantity <= 0) items.splice(idx, 1); }
      } else if (action === 'set') {
        if (Number(quantity) <= 0) { if (idx > -1) items.splice(idx, 1); }
        else if (idx > -1) items[idx].quantity = Number(quantity);
        else items.push({ productId, quantity: Number(quantity) });
      } else if (action === 'delete') { if (idx > -1) items.splice(idx, 1); }
      return res.json({ cart: req.session.cart });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  try {
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    } else {
      req.session.cart = { items: [] };
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Migrate guest cart to user cart on login
exports.mergeCart = async (userId, sessionCart) => {
  if (!sessionCart?.items?.length) return;
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });
  for (const item of sessionCart.items) {
    const idx = cart.items.findIndex(i => i.productId.toString() === item.productId);
    if (idx > -1) cart.items[idx].quantity += item.quantity;
    else cart.items.push(item);
  }
  await cart.save();
};
