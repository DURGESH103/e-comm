const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const socketManager = require('../config/socket');

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.product')
      .session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (!item.product) continue;

      // Atomic stock check + decrement — prevents race conditions
      const updated = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for "${item.product.name}"`,
        });
      }

      totalAmount += (item.product.finalPrice || item.product.price) * item.quantity;
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.finalPrice || item.product.price,
      });
    }

    const [order] = await Order.create(
      [{ user: req.user.id, items: orderItems, shippingAddress, totalAmount }],
      { session }
    );

    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] }, { session });

    await session.commitTransaction();

    const populated = await order.populate('items.product');

    // Real-time: notify user their order was placed
    socketManager.emitToUser(req.user.id.toString(), 'order:created', {
      orderId: order._id,
      status: order.status,
      totalAmount: order.totalAmount,
    });

    res.status(201).json({ success: true, order: populated });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error', error: error.message });
  } finally {
    session.endSession();
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images price finalPrice')
      .sort({ createdAt: -1 })
      .lean();

    const cleanedOrders = orders.map((order) => ({
      ...order,
      items: order.items.filter((item) => item.product != null),
    }));

    res.json({ success: true, orders: cleanedOrders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product')
      .lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.items = order.items.filter((item) => item.product != null);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};

    const [result] = await Order.aggregate([
      { $match: query },
      {
        $facet: {
          orders: [
            { $sort: { createdAt: -1 } },
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    // Populate after aggregation
    await Order.populate(result.orders, [
      { path: 'user', select: 'name email' },
      { path: 'items.product', select: 'name images' },
    ]);

    res.json({
      success: true,
      orders: result.orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil((result.total[0]?.count || 0) / Number(limit)),
        total: result.total[0]?.count || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Real-time: push status update to the customer instantly
    socketManager.emitToUser(order.user._id.toString(), 'order:statusUpdated', {
      orderId: order._id,
      status: order.status,
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getOrders, getOrder, getAllOrders, updateOrderStatus };
