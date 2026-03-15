const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      'products',
      'name images price finalPrice brand ratings stock'
    );
    res.json({ success: true, wishlist: wishlist || { products: [] } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { products: productId } }, // $addToSet prevents duplicates
      { new: true, upsert: true }
    ).populate('products', 'name images price finalPrice brand ratings stock');

    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { products: req.params.productId } },
      { new: true }
    ).populate('products', 'name images price finalPrice brand ratings stock');

    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
