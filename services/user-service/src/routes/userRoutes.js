const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
  validateUserRegister,
  validateUserUpdate,
} = require('../middleware/validation');

// User registration 
router.post('/register', validateUserRegister, userController.register);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/update', validateUserUpdate, userController.updateUser);
router.post('/status', userController.updateUserStatus);

// // Delete user
// router.post('/delete', userController.deleteUser);
// // Get user by email
// router.get('/email/:email', userController.getUserByEmail);



module.exports = router; 