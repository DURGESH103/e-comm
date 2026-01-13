const Product = require('../models/Product');

// POST /api/admin/clothing - Create clothing product
const createClothingProduct = async (req, res) => {
  try {
    console.log('👕 Creating clothing product...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { gender, ...productData } = req.body;
    
    // Validate required gender field
    if (!gender || !['Men', 'Women', 'Kids'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender is required and must be Men, Women, or Kids'
      });
    }
    
    // Force clothing category and set subcategory from gender
    const clothingProductData = {
      ...productData,
      category: 'Clothing',
      subCategory: gender,
      createdBy: req.user.id
    };
    
    console.log('Processed clothing data:', JSON.stringify(clothingProductData, null, 2));
    
    // Create product
    const product = await Product.create(clothingProductData);
    
    console.log(`✅ Clothing product created: ${product.name} (${product.category}/${product.subCategory})`);
    
    res.status(201).json({
      success: true,
      message: 'Clothing product created successfully',
      product
    });
    
  } catch (error) {
    console.error('❌ Error creating clothing product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create clothing product'
    });
  }
};

// GET /api/admin/clothing - Get all clothing products for admin
const getAdminClothingProducts = async (req, res) => {
  try {
    const products = await Product.find({ category: 'Clothing' })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching admin clothing products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch clothing products'
    });
  }
};

// PUT /api/admin/clothing/:id - Update clothing product
const updateClothingProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { gender, ...updateData } = req.body;
    
    // Validate gender if provided
    if (gender && !['Men', 'Women', 'Kids'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be Men, Women, or Kids'
      });
    }
    
    // Force clothing category and set subcategory from gender
    const clothingUpdateData = {
      ...updateData,
      category: 'Clothing',
      ...(gender && { subCategory: gender })
    };
    
    const product = await Product.findByIdAndUpdate(
      id,
      clothingUpdateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Clothing product not found'
      });
    }
    
    console.log(`✅ Clothing product updated: ${product.name} (${product.category}/${product.subCategory})`);
    
    res.json({
      success: true,
      message: 'Clothing product updated successfully',
      product
    });
    
  } catch (error) {
    console.error('❌ Error updating clothing product:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update clothing product'
    });
  }
};

module.exports = {
  createClothingProduct,
  getAdminClothingProducts,
  updateClothingProduct
};