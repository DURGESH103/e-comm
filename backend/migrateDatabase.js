const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const migrateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🚀 STARTING DATABASE MIGRATION...\n');
    
    let updatedCount = 0;
    
    // Get all products
    const allProducts = await Product.find({});
    console.log(`📊 Found ${allProducts.length} products to analyze\n`);
    
    for (const product of allProducts) {
      let needsUpdate = false;
      const updates = {};
      
      // Fix category based on product name patterns
      const name = product.name.toLowerCase();
      const currentCategory = product.category;
      const currentSubCategory = product.subCategory;
      
      // Clothing category fixes
      if (name.includes('shirt') || name.includes('jeans') || name.includes('dress') || 
          name.includes('top') || name.includes('blouse') || name.includes('hoodie') ||
          currentCategory === 'Men' || currentCategory === 'Women' || currentCategory === 'Kids' ||
          currentCategory === 'Fashion' || currentCategory === 'Clothes') {
        
        updates.category = 'Clothing';
        needsUpdate = true;
        
        // Determine subcategory
        if (name.includes("men's") || currentCategory === 'Men') {
          updates.subCategory = 'Men';
        } else if (name.includes("women's") || currentCategory === 'Women') {
          updates.subCategory = 'Women';
        } else if (name.includes('kids') || currentCategory === 'Kids') {
          updates.subCategory = 'Kids';
        } else if (!currentSubCategory || !['Men', 'Women', 'Kids'].includes(currentSubCategory)) {
          // Default assignment based on name patterns
          if (name.includes('men') || name.includes('formal')) {
            updates.subCategory = 'Men';
          } else if (name.includes('women') || name.includes('floral') || name.includes('elegant')) {
            updates.subCategory = 'Women';
          } else if (name.includes('kids') || name.includes('cartoon') || name.includes('colorful')) {
            updates.subCategory = 'Kids';
          } else {
            updates.subCategory = 'Men'; // Default fallback
          }
        }
      }
      
      // Electronics category fixes
      else if (name.includes('smartphone') || name.includes('laptop') || name.includes('phone') || 
               name.includes('computer') || currentCategory === 'Electronics') {
        updates.category = 'Electronics';
        if (name.includes('phone') || name.includes('smartphone')) {
          updates.subCategory = 'Mobile';
        } else if (name.includes('laptop') || name.includes('computer')) {
          updates.subCategory = 'Laptop';
        } else {
          updates.subCategory = 'Mobile'; // Default
        }
        needsUpdate = true;
      }
      
      // Books category fixes
      else if (name.includes('book') || name.includes('novel') || currentCategory === 'Books') {
        updates.category = 'Books';
        updates.subCategory = 'Fiction';
        needsUpdate = true;
      }
      
      // Apply updates if needed
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, updates);
        updatedCount++;
        console.log(`✅ Updated: "${product.name}"`);
        console.log(`   ${currentCategory} → ${updates.category}`);
        console.log(`   ${currentSubCategory} → ${updates.subCategory}\n`);
      }
    }
    
    console.log(`🎉 MIGRATION COMPLETE!`);
    console.log(`📊 Updated ${updatedCount} products\n`);
    
    // Verify results
    const clothingProducts = await Product.find({ category: 'Clothing' });
    const menProducts = await Product.find({ category: 'Clothing', subCategory: 'Men' });
    const womenProducts = await Product.find({ category: 'Clothing', subCategory: 'Women' });
    const kidsProducts = await Product.find({ category: 'Clothing', subCategory: 'Kids' });
    
    console.log('📋 VERIFICATION:');
    console.log(`  Total Clothing products: ${clothingProducts.length}`);
    console.log(`  Men's clothing: ${menProducts.length}`);
    console.log(`  Women's clothing: ${womenProducts.length}`);
    console.log(`  Kids clothing: ${kidsProducts.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateDatabase();