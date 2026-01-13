const Product = require('../models/Product');
const Category = require('../models/Category');

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
      sortOrder = 'desc' 
    } = req.query;

    console.log(`🔍 Product query: category=${category}, subCategory=${subCategory}`);

    const query = {};

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    console.log(`✅ Found ${products.length} products (${total} total)`);

    res.json({
      success: true,
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'];
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSubCategories = async (req, res) => {
  try {
    const { category } = req.params;
    const subCategoryMap = {
      'Clothing': ['Men', 'Women', 'Kids'],
      'Electronics': ['Mobile', 'Laptop', 'Audio'],
      'Books': ['Fiction', 'Non-Fiction', 'Educational'],
      'Home': ['Kitchen', 'Furniture', 'Decor'],
      'Sports': ['Fitness', 'Outdoor', 'Team Sports'],
      'Beauty': ['Skincare', 'Makeup', 'Haircare'],
      'Toys': ['Educational', 'Action', 'Board Games']
    };
    
    const subCategories = subCategoryMap[category] || [];
    res.json({ success: true, subCategories });
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
  getSubCategories
};