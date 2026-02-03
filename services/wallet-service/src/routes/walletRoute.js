const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');

// Get wallet by userId
router.get('/:userId', walletController.getWallet);

module.exports = router;
