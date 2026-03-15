const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

// Admin: Add Product
const addProduct = async (req, res) => {
  try {
    console.log('Received product data:', req.body);
    console.log('Category type:', typeof req.body.category);
    console.log('Category value:', req.body.category);
    
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      discount: req.body.discount,
      stock: req.body.stock,
      category: req.body.category,
      subCategory: req.body.subCategory,
      tags: req.body.tags,
      images: req.body.images,
      brand: req.body.brand,
      isFeatured: req.body.isFeatured,
      createdBy: req.user._id
    };
    
    console.log('Product data before save:', productData);
    console.log('Category in productData:', productData.category, typeof productData.category);
    
    const product = new Product(productData);
    console.log('Product after creation:', product.category, typeof product.category);
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Error adding product:', error);
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
    );
    
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
    // Return hardcoded categories for now to avoid confusion
    const categories = [
      { _id: '1', name: 'Clothing', isActive: true },
      { _id: '2', name: 'Electronics', isActive: true },
      { _id: '3', name: 'Books', isActive: true },
      { _id: '4', name: 'Home', isActive: true },
      { _id: '5', name: 'Sports', isActive: true },
      { _id: '6', name: 'Beauty', isActive: true },
      { _id: '7', name: 'Toys', isActive: true }
    ];
    
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

// Admin: Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort('-createdAt');
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
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
  getCategories,
  getOrders,
  updateOrderStatus
};