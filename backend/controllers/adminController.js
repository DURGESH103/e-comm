const Product = require('../models/Product');
const Category = require('../models/Category');

// Admin: Add Product
const addProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const product = new Product(productData);
    await product.save();
    await product.populate('category', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Update Product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Add Category
const addCategory = async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const category = new Category(categoryData);
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      category
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Products (with filters)
const getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      tags,
      brand,
      sort = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;
    
    const filter = {};
    
    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (tags) filter.tags = { $in: tags.split(',') };
    if (minPrice || maxPrice) {
      filter.finalPrice = {};
      if (minPrice) filter.finalPrice.$gte = Number(minPrice);
      if (maxPrice) filter.finalPrice.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }
    
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      products,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get Single Product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('reviews');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get All Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  getProducts,
  getProduct,
  getCategories
};