const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
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
};
