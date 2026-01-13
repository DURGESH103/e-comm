const express = require('express');
const {
  getClothingProducts,
  getMenClothing,
  getWomenClothing,
  getKidsClothing
} = require('../controllers/clothingController');

const router = express.Router();

router.get('/', getClothingProducts);
router.get('/men', getMenClothing);
router.get('/women', getWomenClothing);
router.get('/kids', getKidsClothing);

module.exports = router;