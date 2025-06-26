const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/orders', orderController.createOrder);
router.post('/easebuzz-order', orderController.initiatePayment);
router.post('/orders/payment-success', orderController.paymentSuccess);
router.post('/orders/payment-failure', orderController.paymentFailure);

module.exports = router;
