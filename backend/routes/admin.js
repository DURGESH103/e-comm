const express = require('express');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  getProducts,
  getCategories,
  getOrders,
  updateOrderStatus
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Admin Product Routes
router.post('/products', auth, adminAuth, addProduct);
router.put('/products/:id', auth, adminAuth, updateProduct);
router.delete('/products/:id', auth, adminAuth, deleteProduct);
router.get('/products', auth, adminAuth, getProducts);

// Admin Category Routes
router.post('/categories', auth, adminAuth, addCategory);
router.get('/categories', auth, adminAuth, getCategories);

// Admin Order Routes
router.get('/orders', auth, adminAuth, getOrders);
router.put('/orders/:id', auth, adminAuth, updateOrderStatus);

module.exports = router;