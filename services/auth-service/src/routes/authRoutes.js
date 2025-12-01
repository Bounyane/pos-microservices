const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { 
  validateLogin, 
  sanitizeInput 
} = require('../middleware/validation');

// Core authentication routes
router.post('/login', sanitizeInput, validateLogin, authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/validate', verifyToken, authController.getTokenInfo);
router.post('/refresh', verifyToken, authController.refreshToken);

module.exports = router; 