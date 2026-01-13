const express = require('express');
const {
  getProducts,
  getProduct,
  getCategories,
  getSubCategories
} = require('../controllers/productController');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/categories/:category/subcategories', getSubCategories);
router.get('/:id', getProduct);

module.exports = router;