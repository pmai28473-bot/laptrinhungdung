const express = require('express');
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.post('/', createOrder);
router.get('/', protect, adminOnly, getOrders);
router.get('/:id', protect, adminOnly, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
