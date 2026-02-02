const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Create transaction (POST)
router.post('/', transactionController.createTransaction);

module.exports = router;
