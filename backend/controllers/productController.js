const Product = require('../models/Product');
const cache = require('../config/cache');

const CACHE_TTL = 300; // 5 minutes

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subCategory,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags,
    } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const query = {};
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.finalPrice = {};
      if (minPrice) query.finalPrice.$gte = Number(minPrice);
      if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (Number(page) - 1) * Number(limit);

    // Single aggregation instead of find + countDocuments
    const [result] = await Product.aggregate([
      { $match: query },
      {
        $facet: {
          products: [{ $sort: sort }, { $skip: skip }, { $limit: Number(limit) }],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    const total = result.total[0]?.count || 0;
    const response = {
      success: true,
      products: result.products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total,
      },
    };

    await cache.set(cacheKey, response, CACHE_TTL);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const cacheKey = `product:${req.params.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const response = { success: true, product };
    await cache.set(cacheKey, response, CACHE_TTL);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    await cache.delPattern('products:*');
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await cache.del(`product:${req.params.id}`);
    await cache.delPattern('products:*');
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await cache.del(`product:${req.params.id}`);
    await cache.delPattern('products:*');
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCategories = async (req, res) => {
  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'];
  res.json({ success: true, categories });
};

const getSubCategories = async (req, res) => {
  const subCategoryMap = {
    Clothing: ['Men', 'Women', 'Kids'],
    Electronics: ['Mobile', 'Laptop', 'Audio'],
    Books: ['Fiction', 'Non-Fiction', 'Educational'],
    Home: ['Kitchen', 'Furniture', 'Decor'],
    Sports: ['Fitness', 'Outdoor', 'Team Sports'],
    Beauty: ['Skincare', 'Makeup', 'Haircare'],
    Toys: ['Educational', 'Action', 'Board Games'],
  };
  const subCategories = subCategoryMap[req.params.category] || [];
  res.json({ success: true, subCategories });
};

const getProductVariants = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('attributes variants')
      .lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true, attributes: product.attributes, variants: product.variants });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSubCategories,
  getProductVariants,
};
