const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const inspectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 INSPECTING DATABASE...\n');
    
    const allProducts = await Product.find({});
    console.log(`📊 Total products: ${allProducts.length}\n`);
    
    // Group by category
    const categoryGroups = {};
    allProducts.forEach(product => {
      const cat = product.category || 'UNDEFINED';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(product);
    });
    
    console.log('📋 CATEGORY BREAKDOWN:');
    Object.keys(categoryGroups).forEach(category => {
      console.log(`  ${category}: ${categoryGroups[category].length} products`);
    });
    
    console.log('\n🔍 DETAILED PRODUCT ANALYSIS:');
    allProducts.forEach(product => {
      console.log(`- "${product.name}"`);
      console.log(`  category: "${product.category}"`);
      console.log(`  subCategory: "${product.subCategory}"`);
      console.log('');
    });
    
    // Check for problematic products
    console.log('⚠️  PROBLEMATIC PRODUCTS:');
    const problematic = allProducts.filter(p => 
      !p.category || 
      (p.category !== 'Clothing' && p.category !== 'Electronics' && p.category !== 'Books' && p.category !== 'Home' && p.category !== 'Sports' && p.category !== 'Beauty' && p.category !== 'Toys') ||
      (p.category === 'Clothing' && (!p.subCategory || !['Men', 'Women', 'Kids'].includes(p.subCategory)))
    );
    
    console.log(`Found ${problematic.length} problematic products:`);
    problematic.forEach(p => {
      console.log(`  - ${p.name}: category="${p.category}", subCategory="${p.subCategory}"`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

inspectDatabase();