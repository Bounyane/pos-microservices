const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Add Order (POST) - Direct insert
router.post('/asyncOrder', orderController.asyncOrder);

// Update Order (Post)
router.post('/updateOrder', orderController.updateOrder);

module.exports = router;
