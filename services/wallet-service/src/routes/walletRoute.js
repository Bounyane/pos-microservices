const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Get balance for authenticated user
router.get('/balance', walletController.getBalance);

// Get wallet by userId
//router.get('/:userId', walletController.getWallet);

module.exports = router;
