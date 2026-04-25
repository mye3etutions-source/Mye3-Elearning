const express = require('express');
const router = express.Router();
const { createOrder, razorpayWebhook, getPaymentConfig, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/config', protect, getPaymentConfig);
router.post('/orders', protect, createOrder);
router.post('/verify', protect, verifyPayment);
// Webhook should be public but authenticated by signature
router.post('/webhook', razorpayWebhook);

module.exports = router;
