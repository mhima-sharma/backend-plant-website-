const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.post('/payments/update-status', orderController.updatePaymentStatus);
router.post('/orders/update-stock', orderController.updateStock);





// Update Easebuzz payment status
// router.post('/update-easebuzz-status', orderController.updateEasebuzzPaymentStatus);
// Razorpay webhook endpoint
// router.post('/razorpay-webhook', orderController.handleRazorpayWebhook);

// router.post('/easebuzz-order', orderController.initiatePayment);
// router.post('/orders/payment-success', orderController.paymentSuccess);
// router.post('/orders/payment-failure', orderController.paymentFailure);

module.exports = router;
