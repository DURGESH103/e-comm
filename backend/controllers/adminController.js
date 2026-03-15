const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const cache = require('../config/cache');
const socketManager = require('../config/socket');

const addProduct = async (req, res) => {
  try {
    const product = new Product({ ...req.body, createdBy: req.user.id });
    await product.save();
    await cache.delPattern('products:*');
    res.status(201).json({ success: true, message: 'Product added successfully', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await cache.del(`product:${req.params.id}`);
    await cache.delPattern('products:*');
    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await cache.del(`product:${req.params.id}`);
    await cache.delPattern('products:*');
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const category = new Category({ ...req.body, createdBy: req.user.id });
    await category.save();
    res.status(201).json({ success: true, message: 'Category added successfully', category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const [result] = await Product.aggregate([
      { $match: query },
      {
        $facet: {
          products: [
            { $sort: { createdAt: -1 } },
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    res.json({
      success: true,
      products: result.products,
      pagination: {
        current: Number(page),
        pages: Math.ceil((result.total[0]?.count || 0) / Number(limit)),
        total: result.total[0]?.count || 0,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getCategories = async (req, res) => {
  const categories = [
    { _id: '1', name: 'Clothing', isActive: true },
    { _id: '2', name: 'Electronics', isActive: true },
    { _id: '3', name: 'Books', isActive: true },
    { _id: '4', name: 'Home', isActive: true },
    { _id: '5', name: 'Sports', isActive: true },
    { _id: '6', name: 'Beauty', isActive: true },
    { _id: '7', name: 'Toys', isActive: true },
  ];
  res.json({ success: true, categories });
};

const getOrders = async (req, res) => {
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
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: { statusHistory: { status, timestamp: new Date() } },
      },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .lean();

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Real-time push to the customer
    socketManager.emitToUser(order.user._id.toString(), 'order:statusUpdated', {
      orderId: order._id,
      status: order.status,
    });

    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const cacheKey = 'admin:dashboard:stats';
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const [orderStats, totalProducts, totalUsers] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
      ]),
      Product.countDocuments(),
      require('../models/User').countDocuments({ role: 'user' }),
    ]);

    const stats = {
      success: true,
      orders: orderStats,
      totalProducts,
      totalUsers,
      totalRevenue: orderStats
        .filter((s) => s._id === 'Delivered')
        .reduce((sum, s) => sum + s.revenue, 0),
    };

    await cache.set(cacheKey, stats, 60); // 1-minute cache for live-ish stats
    res.json(stats);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── User Management ──────────────────────────────────────────────────────────

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, role, status } = req.query;
    const query = {};

    if (role && ['user', 'admin'].includes(role)) query.role = role;
    if (status === 'blocked')  query.isBlocked = true;
    if (status === 'active')   query.isBlocked = false;
    if (search) {
      const re = new RegExp(search.trim(), 'i');
      query.$or = [{ name: re }, { email: re }];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -addresses')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Attach order summary
    const [orderCount, totalSpent] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.aggregate([
        { $match: { user: user._id, status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]).then((r) => r[0]?.total ?? 0),
    ]);

    res.json({ success: true, user: { ...user, orderCount, totalSpent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('role isBlocked name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot block an admin' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete an admin' });
    if (req.params.id === req.user.id) return res.status(403).json({ success: false, message: 'Cannot delete yourself' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  getProducts,
  getCategories,
  getOrders,
  updateOrderStatus,
  getDashboardStats,
  getUsers,
  getUserById,
  toggleBlockUser,
  deleteUser,
};

