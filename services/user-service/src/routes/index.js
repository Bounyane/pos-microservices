const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const managerRoutes = require('./managerRoute');
const dealerRoute = require('./dealerRoute');

const userController = require('../controllers/userController');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User service is running',
    timestamp: new Date().toISOString(),
    service: 'user-service'
  });
});

// API routes
router.use('/users', userRoutes);

// Manager routes
router.use('/managers', managerRoutes);

// Dealer routes
router.use('/dealers', dealerRoute);

module.exports = router; 