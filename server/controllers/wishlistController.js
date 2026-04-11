const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/wishlist  { productId }
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex(id => id.toString() === productId);
    let action;
    if (idx > -1) { user.wishlist.splice(idx, 1); action = 'removed'; }
    else { user.wishlist.push(productId); action = 'added'; }
    await user.save();
    res.json({ action, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
