const express = require('express');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  getProducts,
  getCategories,
  getOrders,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(auth, adminAuth);

router.get('/dashboard/stats', getDashboardStats);

router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products', getProducts);

router.post('/categories', addCategory);
router.get('/categories', getCategories);

router.get('/orders', getOrders);
router.put('/orders/:id', updateOrderStatus);

module.exports = router;
