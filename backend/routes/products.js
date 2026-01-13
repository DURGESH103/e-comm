const express = require('express');
const {
  getProducts,
  getProduct,
  getCategories
} = require('../controllers/productController');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

module.exports = router;