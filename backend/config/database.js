const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Ensure all critical indexes exist on startup
    conn.connection.once('open', async () => {
      try {
        const db = conn.connection.db;
        await db.collection('orders').createIndex({ user: 1, createdAt: -1 });
        await db.collection('orders').createIndex({ status: 1 });
        await db.collection('carts').createIndex({ user: 1 }, { unique: true });
        await db.collection('wishlists').createIndex({ user: 1 }, { unique: true });
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('reviews').createIndex({ product: 1, createdAt: -1 });
      } catch (_) {
        // Indexes may already exist — safe to ignore
      }
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
