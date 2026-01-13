const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/all', adminAuth, getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', adminAuth, updateOrderStatus);

module.exports = router;