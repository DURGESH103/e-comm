const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.json({ success: true, cart: { items: [] } });
    }
    
    // Filter out items with null products (deleted products)
    const validItems = cart.items.filter(item => item.product != null);
    
    // Update cart if invalid items were found
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    
    res.json({ success: true, cart: { ...cart.toObject(), items: validItems } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');
    
    // Filter out items with null products before sending response
    const validItems = cart.items.filter(item => item.product != null);
    cart.items = validItems;

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => 
        item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product');
    
    // Filter out items with null products before sending response
    const validItems = cart.items.filter(item => item.product != null);
    cart.items = validItems;

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');
    
    // Filter out items with null products before sending response
    const validItems = cart.items.filter(item => item.product != null);
    cart.items = validItems;

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] },
      { new: true }
    );
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};