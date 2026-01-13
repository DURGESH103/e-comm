const Product = require('../models/Product');

// GET /api/clothing - All clothing products
const getClothingProducts = async (req, res) => {
  try {
    console.log('🔍 Fetching all clothing products...');
    
    const products = await Product.find({ category: 'Clothing' })
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} clothing products`);
    
    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching clothing products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/clothing/men - Men's clothing only
const getMenClothing = async (req, res) => {
  try {
    console.log('🔍 Fetching men\'s clothing...');
    
    const products = await Product.find({ 
      category: 'Clothing',
      subCategory: 'Men'
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} men's clothing products`);
    
    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching men\'s clothing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/clothing/women - Women's clothing only
const getWomenClothing = async (req, res) => {
  try {
    console.log('🔍 Fetching women\'s clothing...');
    
    const products = await Product.find({ 
      category: 'Clothing',
      subCategory: 'Women'
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} women's clothing products`);
    
    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching women\'s clothing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/clothing/kids - Kids clothing only
const getKidsClothing = async (req, res) => {
  try {
    console.log('🔍 Fetching kids clothing...');
    
    const products = await Product.find({ 
      category: 'Clothing',
      subCategory: 'Kids'
    }).sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} kids clothing products`);
    
    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('❌ Error fetching kids clothing:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getClothingProducts,
  getMenClothing,
  getWomenClothing,
  getKidsClothing
};