const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Protected — must be logged in to get personalised results
router.get('/', auth, getRecommendations);

module.exports = router;
