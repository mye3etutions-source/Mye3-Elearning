const express = require('express');
const router = express.Router();
const { createOrder, razorpayWebhook, getPaymentConfig, verifyPayment, getMockOrderPrice } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', protect, getPaymentConfig);
router.post('/orders', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/mock-price', protect, getMockOrderPrice);
// Webhook should be public but authenticated by signature
router.post('/webhook', razorpayWebhook);

module.exports = router;
