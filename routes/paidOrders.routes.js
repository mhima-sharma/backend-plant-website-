const express = require('express');
const router = express.Router();
const { getPaidOrders } = require('../controllers/paidOrdersController');

router.get('/paid-orders', getPaidOrders);

module.exports = router;
