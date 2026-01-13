const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const debugDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check all products
    const allProducts = await Product.find({});
    console.log('\n=== ALL PRODUCTS ===');
    console.log(`Total products: ${allProducts.length}`);
    
    allProducts.forEach(product => {
      console.log(`- ${product.name}: category="${product.category}", subCategory="${product.subCategory}"`);
    });
    
    // Test clothing queries
    console.log('\n=== CLOTHING QUERIES ===');
    
    // Exact match
    const exactClothing = await Product.find({ category: 'Clothing' });
    console.log(`Exact "Clothing" match: ${exactClothing.length} products`);
    
    // Case-insensitive match
    const caseInsensitiveClothing = await Product.find({ category: { $regex: /^clothing$/i } });
    console.log(`Case-insensitive "clothing" match: ${caseInsensitiveClothing.length} products`);
    
    // Men's clothing
    const menClothing = await Product.find({ 
      category: { $regex: /^clothing$/i },
      subCategory: { $regex: /^men$/i }
    });
    console.log(`Men's clothing: ${menClothing.length} products`);
    
    // Women's clothing
    const womenClothing = await Product.find({ 
      category: { $regex: /^clothing$/i },
      subCategory: { $regex: /^women$/i }
    });
    console.log(`Women's clothing: ${womenClothing.length} products`);
    
    // Kids clothing
    const kidsClothing = await Product.find({ 
      category: { $regex: /^clothing$/i },
      subCategory: { $regex: /^kids$/i }
    });
    console.log(`Kids clothing: ${kidsClothing.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugDatabase();