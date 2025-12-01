const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
  validateUserRegister, 
  validateUserUpdate, 
} = require('../middleware/validation');

// User registration - MUST come before /:id route
router.post('/register', validateUserRegister, userController.register);

// Get all users with pagination and filters
router.get('/', userController.getUsers);


// Get user by ID 
router.get('/:id', userController.getUserById);

// Update user profile
router.post('/update', validateUserUpdate, userController.updateUser);

// Update user status
router.post('/status', userController.updateUserStatus);

// // Delete user
// router.post('/delete', userController.deleteUser);
// // Get user by email
// router.get('/email/:email', userController.getUserByEmail);



module.exports = router; 