const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
  validateUserRegister, 
  validateUserUpdate, 
  validateManager, 
  validateDealer 
} = require('../middleware/validation');

// User registration - MUST come before /:id route
router.post('/register', validateUserRegister, userController.register);

// Get all users with pagination and filters
router.get('/', userController.getUsers);

// Get user by email
router.get('/email/:email', userController.getUserByEmail);

// Get user by ID 
router.get('/:id', userController.getUserById);

// Update user profile
router.put('/:id', validateUserUpdate, userController.updateUser);

// Update user status
router.patch('/:id/status', userController.updateUserStatus);

// Delete user
router.delete('/:id', userController.deleteUser);

// Manager profile routes
router.post('/:id/manager', validateManager, userController.createManagerProfile);
router.get('/:id/manager', userController.getManagerProfile);
router.put('/:id/manager', userController.updateManagerProfile);

// Dealer profile routes
router.post('/:id/dealer', validateDealer, userController.createDealerProfile);
router.get('/:id/dealer', userController.getDealerProfile);
router.put('/:id/dealer', userController.updateDealerProfile);

module.exports = router; 