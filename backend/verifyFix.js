const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const verifyFix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 FINAL VERIFICATION...\n');
    
    // Test all clothing queries
    const allClothing = await Product.find({ category: 'Clothing' });
    const menClothing = await Product.find({ category: 'Clothing', subCategory: 'Men' });
    const womenClothing = await Product.find({ category: 'Clothing', subCategory: 'Women' });
    const kidsClothing = await Product.find({ category: 'Clothing', subCategory: 'Kids' });
    
    console.log('📊 CLOTHING PRODUCTS:');
    console.log(`  Total Clothing: ${allClothing.length}`);
    console.log(`  Men's Clothing: ${menClothing.length}`);
    console.log(`  Women's Clothing: ${womenClothing.length}`);
    console.log(`  Kids Clothing: ${kidsClothing.length}\n`);
    
    // Verify data consistency
    console.log('✅ DATA CONSISTENCY CHECK:');
    const allProducts = await Product.find({});
    let validProducts = 0;
    let invalidProducts = 0;
    
    for (const product of allProducts) {\n      const validCategories = ['Clothing', 'Electronics', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'];\n      const validSubCategories = {\n        'Clothing': ['Men', 'Women', 'Kids'],\n        'Electronics': ['Mobile', 'Laptop', 'Audio'],\n        'Books': ['Fiction', 'Non-Fiction', 'Educational'],\n        'Home': ['Kitchen', 'Furniture', 'Decor'],\n        'Sports': ['Fitness', 'Outdoor', 'Team Sports'],\n        'Beauty': ['Skincare', 'Makeup', 'Haircare'],\n        'Toys': ['Educational', 'Action', 'Board Games']\n      };\n      \n      if (validCategories.includes(product.category) && \n          validSubCategories[product.category]?.includes(product.subCategory)) {\n        validProducts++;\n      } else {\n        invalidProducts++;\n        console.log(`❌ Invalid: ${product.name} - ${product.category}/${product.subCategory}`);\n      }\n    }\n    \n    console.log(`  Valid products: ${validProducts}`);\n    console.log(`  Invalid products: ${invalidProducts}`);\n    \n    if (invalidProducts === 0) {\n      console.log('\\n🎉 SUCCESS! All products have valid categories and subcategories.');\n    } else {\n      console.log('\\n⚠️  Some products still have invalid data. Run migration again.');\n    }\n    \n    // Test API endpoints simulation\n    console.log('\\n🔗 API ENDPOINT SIMULATION:');\n    console.log(`  GET /api/clothing → ${allClothing.length} products`);\n    console.log(`  GET /api/clothing/men → ${menClothing.length} products`);\n    console.log(`  GET /api/clothing/women → ${womenClothing.length} products`);\n    console.log(`  GET /api/clothing/kids → ${kidsClothing.length} products`);\n    \n    process.exit(0);\n  } catch (error) {\n    console.error('❌ Verification failed:', error);\n    process.exit(1);\n  }\n};\n\nverifyFix();