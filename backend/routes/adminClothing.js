const express = require('express');
const {
  createClothingProduct,
  getAdminClothingProducts,
  updateClothingProduct
} = require('../controllers/adminClothingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(auth);

// Clothing product routes
router.post('/', createClothingProduct);
router.get('/', getAdminClothingProducts);
router.put('/:id', updateClothingProduct);

module.exports = router;