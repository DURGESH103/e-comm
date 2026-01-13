const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  // Clothing - Men
  {
    name: "Men's Cotton T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear",
    price: 599,
    stock: 50,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
    category: "Clothing",
    subCategory: "Men",
    brand: "StyleCo",
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    name: "Men's Denim Jeans",
    description: "Classic blue denim jeans with perfect fit",
    price: 1299,
    stock: 30,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"],
    category: "Clothing",
    subCategory: "Men",
    brand: "DenimPro",
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    name: "Men's Formal Shirt",
    description: "Professional formal shirt for office wear",
    price: 899,
    stock: 40,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"],
    category: "Clothing",
    subCategory: "Men",
    brand: "FormalWear",
    createdBy: "507f1f77bcf86cd799439011"
  },
  
  // Clothing - Women
  {
    name: "Women's Floral Dress",
    description: "Beautiful floral print dress for special occasions",
    price: 1599,
    stock: 25,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"],
    category: "Clothing",
    subCategory: "Women",
    brand: "FloralFashion",
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    name: "Women's Casual Top",
    description: "Comfortable and stylish casual top",
    price: 799,
    stock: 40,
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400"],
    category: "Clothing",
    subCategory: "Women",
    brand: "CasualWear",
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    name: "Women's Elegant Blouse",
    description: "Elegant blouse perfect for work and casual outings",
    price: 1099,
    stock: 35,
    images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"],
    category: "Clothing",
    subCategory: "Women",
    brand: "ElegantStyle",
    createdBy: "507f1f77bcf86cd799439011"
  },
  
  // Clothing - Kids
  {
    name: "Kids Cartoon T-Shirt",
    description: "Fun cartoon printed t-shirt for kids",
    price: 399,
    stock: 60,
    images: ["https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400"],
    category: "Clothing",
    subCategory: "Kids",
    brand: "KidsFun",
    createdBy: "507f1f77bcf86cd799439011"
  },
  {
    name: "Kids Colorful Hoodie",
    description: "Warm and colorful hoodie for children",
    price: 699,
    stock: 45,
    images: ["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"],
    category: "Clothing",
    subCategory: "Kids",
    brand: "KidsWarm",
    createdBy: "507f1f77bcf86cd799439011"
  },
  
  // Electronics - Mobile
  {
    name: "Smartphone Pro Max",
    description: "Latest smartphone with advanced features",
    price: 79999,
    stock: 15,
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"],
    category: "Electronics",
    subCategory: "Mobile",
    brand: "TechPro",
    createdBy: "507f1f77bcf86cd799439011"
  },
  
  // Electronics - Laptop
  {
    name: "Gaming Laptop Ultra",
    description: "High-performance gaming laptop",
    price: 89999,
    stock: 10,
    images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"],
    category: "Electronics",
    subCategory: "Laptop",
    brand: "GameTech",
    createdBy: "507f1f77bcf86cd799439011"
  },
  
  // Books - Fiction
  {
    name: "Mystery Novel Collection",
    description: "Bestselling mystery novels bundle",
    price: 899,
    stock: 35,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"],
    category: "Books",
    subCategory: "Fiction",
    brand: "BookWorld",
    createdBy: "507f1f77bcf86cd799439011"
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Create proper ObjectId for createdBy
    const adminId = new mongoose.Types.ObjectId();
    
    // Update all products with proper ObjectId
    const productsWithObjectId = sampleProducts.map(product => ({
      ...product,
      createdBy: adminId
    }));
    
    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithObjectId);
    console.log(`Sample products inserted successfully: ${insertedProducts.length} products`);
    
    // Verify clothing products
    const clothingProducts = await Product.find({ category: { $regex: /^clothing$/i } });
    console.log(`Clothing products in database: ${clothingProducts.length}`);
    
    clothingProducts.forEach(product => {
      console.log(`- ${product.name}: category="${product.category}", subCategory="${product.subCategory}"`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();