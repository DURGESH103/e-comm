const Cart = require('../models/Cart');
const Product = require('../models/Product');

const populateAndClean = async (cart) => {
  await cart.populate('items.product', 'name images price finalPrice stock brand');
  cart.items = cart.items.filter((item) => item.product != null);
  return cart;
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'name images price finalPrice stock brand'
    );
    if (!cart) return res.json({ success: true, cart: { items: [] } });

    const validItems = cart.items.filter((item) => item.product != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({ success: true, cart: { ...cart.toObject(), items: validItems } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Variant stock check
    if (variantId) {
      const variant = product.variants?.find((v) => v._id.toString() === variantId);
      if (!variant) return res.status(404).json({ message: 'Variant not found' });
      if (variant.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });
    } else {
      if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const existingItem = cart.items.find(
      (i) => i.product.toString() === productId &&
        (variantId ? i.variantId?.toString() === variantId : !i.variantId)
    );

    const maxStock = variantId
      ? product.variants.find((v) => v._id.toString() === variantId)?.stock
      : product.stock;

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, maxStock);
    } else {
      cart.items.push({ product: productId, variantId: variantId || null, quantity });
    }

    await cart.save();
    await populateAndClean(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const matchItem = (i) =>
      i.product.toString() === productId &&
      (variantId ? i.variantId?.toString() === variantId : !i.variantId);

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => !matchItem(i));
    } else {
      const item = cart.items.find(matchItem);
      if (!item) return res.status(404).json({ message: 'Item not found in cart' });
      item.quantity = quantity;
    }

    await cart.save();
    await populateAndClean(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const { productId, variantId } = req.params;
    cart.items = cart.items.filter(
      (i) => !(
        i.product.toString() === productId &&
        (variantId ? i.variantId?.toString() === variantId : !i.variantId)
      )
    );
    await cart.save();
    await populateAndClean(cart);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
