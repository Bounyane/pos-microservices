const UserService = require('../services/UserService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class UserController {
  /**
   * Register a new user
   * POST /api/users/register
   */
  async register(req, res) {
    try {
      const userData = req.body;
      const user = await UserService.registerUser(userData);

      return ApiResponse.created(res, user, 'User registered successfully');
    } catch (error) {
      logger.error('User registration error:', error);

      if (error.message.includes('already exists')) {
        return ApiResponse.conflict(res, error.message);
      }

      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user by ID error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.internalServerError(res, error.message);
    }
  }

  /**
   * Get user by email
   * GET /api/users/email/:email
   */
  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await UserService.getUserByEmail(email);

      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user by email error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.internalServerError(res, error.message);
    }
  }

  /**
   * Update user profile
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const { id, ...updateData } = req.body;
      const user = await UserService.updateUser(id, updateData);

      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.notFound(res, error.message);
      }

      if (error.message.includes('already in use')) {
        return ApiResponse.conflict(res, error.message);
      }

      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.body;
      console.log('test: ' + JSON.stringify(req.body));
      const result = await UserService.deleteUser(id);

      return ApiResponse.success(res, result, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.internalServerError(res, error.message);
    }
  }

  /**
   * Get all users with pagination and filters
   * GET /api/users
   */
  async getUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        status,
        search
      } = req.query;

      const filters = {};
      if (role) filters.role = role;
      if (status) filters.status = status;
      if (search) filters.search = search;

      const result = await UserService.getUsers(filters, parseInt(page), parseInt(limit));

      return ApiResponse.success(res, result, 'Users retrieved successfully');
    } catch (error) {
      logger.error('Get users error:', error);
      return ApiResponse.internalServerError(res, error.message);
    }
  }

  /**
   * Update user status
   * PATCH /api/users/:id/status
   */
  async updateUserStatus(req, res) {
    try {
      const { id, status } = req.body;

      if (!['ACTIVE', 'REFUSED', 'REMOVED', 'PENDING'].includes(status)) {
        return ApiResponse.badRequest(res, 'Invalid status value');
      }

      const user = await UserService.updateUserStatus(id, status);

      return ApiResponse.success(res, user, 'User status updated successfully');
    } catch (error) {
      logger.error('Update user status error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.internalServerError(res, error.message);
    }
  }



}

module.exports = new UserController(); 