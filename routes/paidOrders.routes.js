// routes/paidOrders.route.js
const express = require('express');
const router = express.Router();

const { getPaidOrders } = require('../controllers/paidOrdersController');

// GET all paid orders
router.get('/paid-orders', getPaidOrders);

module.exports = router;
