const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Add Order (POST) - Direct insert
router.post('/asyncOrder', orderController.asyncOrder);

// Add OrderItem (POST) - Direct insert
router.post('/asyncOrderItem', orderController.asyncOrderItem);

module.exports = router;
