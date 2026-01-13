require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const connectDB = require('./config/database');

const sampleProducts = [
  {
    name: "iPhone 14 Pro",
    description: "Latest iPhone with A16 Bionic chip and Pro camera system",
    price: 79999,
    originalPrice: 89999,
    category: "Electronics",
    brand: "Apple",
    images: ["https://via.placeholder.com/400x400?text=iPhone+14+Pro"],
    stock: 50,
    specifications: {
      "Display": "6.1-inch Super Retina XDR",
      "Chip": "A16 Bionic",
      "Camera": "48MP Main camera",
      "Storage": "128GB"
    }
  },
  {
    name: "Samsung Galaxy S23",
    description: "Flagship Android phone with excellent camera",
    price: 69999,
    originalPrice: 79999,
    category: "Electronics",
    brand: "Samsung",
    images: ["https://via.placeholder.com/400x400?text=Galaxy+S23"],
    stock: 30,
    specifications: {
      "Display": "6.1-inch Dynamic AMOLED",
      "Processor": "Snapdragon 8 Gen 2",
      "Camera": "50MP Triple camera",
      "Storage": "128GB"
    }
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with Air Max technology",
    price: 8999,
    originalPrice: 12999,
    category: "Sports",
    brand: "Nike",
    images: ["https://via.placeholder.com/400x400?text=Nike+Air+Max"],
    stock: 100,
    specifications: {
      "Type": "Running Shoes",
      "Material": "Mesh and Synthetic",
      "Sole": "Rubber",
      "Technology": "Air Max"
    }
  },
  {
    name: "Levi's 501 Jeans",
    description: "Classic straight fit jeans",
    price: 3999,
    originalPrice: 4999,
    category: "Clothing",
    brand: "Levi's",
    images: ["https://via.placeholder.com/400x400?text=Levis+Jeans"],
    stock: 75,
    specifications: {
      "Fit": "Straight",
      "Material": "100% Cotton",
      "Wash": "Dark Blue",
      "Size": "32x32"
    }
  },
  {
    name: "MacBook Air M2",
    description: "Lightweight laptop with M2 chip",
    price: 99999,
    originalPrice: 119999,
    category: "Electronics",
    brand: "Apple",
    images: ["https://via.placeholder.com/400x400?text=MacBook+Air"],
    stock: 25,
    specifications: {
      "Processor": "Apple M2",
      "RAM": "8GB",
      "Storage": "256GB SSD",
      "Display": "13.6-inch Liquid Retina"
    }
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      password: 'admin123',
      role: 'admin'
    });
    
    // Create sample products
    await Product.insertMany(sampleProducts);
    
    console.log('Sample data seeded successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@ecommerce.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();