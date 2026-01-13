require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const User = require('./models/User');
const connectDB = require('./config/database');

const defaultCategories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Clothing', description: 'Fashion and apparel' },
  { name: 'Books', description: 'Books and literature' },
  { name: 'Home', description: 'Home and garden items' },
  { name: 'Sports', description: 'Sports and fitness equipment' },
  { name: 'Beauty', description: 'Beauty and personal care' },
  { name: 'Toys', description: 'Toys and games' }
];

const seedCategories = async () => {
  try {
    await connectDB();
    
    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('Admin user not found. Please run seedData.js first.');
      process.exit(1);
    }
    
    // Clear existing categories
    await Category.deleteMany({});
    
    // Create categories with admin as creator
    const categories = defaultCategories.map(cat => ({
      ...cat,
      createdBy: adminUser._id
    }));
    
    await Category.insertMany(categories);
    
    console.log('Default categories seeded successfully!');
    console.log('Categories:', defaultCategories.map(c => c.name).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();