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
      const { id } = req.params;
      const updateData = req.body;
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
      const { id } = req.params;
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
      const { id } = req.params;
      const { status } = req.body;
      
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

  /**
   * Create manager profile
   * POST /api/users/:id/manager
   */
  async createManagerProfile(req, res) {
    try {
      const { id } = req.params;
      const managerData = req.body;
      const manager = await UserService.createManagerProfile(id, managerData);
      
      return ApiResponse.created(res, manager, 'Manager profile created successfully');
    } catch (error) {
      logger.error('Create manager profile error:', error);
      
      if (error.message.includes('not found')) {
        return ApiResponse.notFound(res, error.message);
      }
      
      if (error.message.includes('already exists')) {
        return ApiResponse.conflict(res, error.message);
      }
      
      if (error.message.includes('manager role')) {
        return ApiResponse.badRequest(res, error.message);
      }
      
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Create dealer profile
   * POST /api/users/:id/dealer
   */
  async createDealerProfile(req, res) {
    try {
      const { id } = req.params;
      const dealerData = req.body;
      const dealer = await UserService.createDealerProfile(id, dealerData);
      
      return ApiResponse.created(res, dealer, 'Dealer profile created successfully');
    } catch (error) {
      logger.error('Create dealer profile error:', error);
      
      if (error.message.includes('not found')) {
        return ApiResponse.notFound(res, error.message);
      }
      
      if (error.message.includes('already exists')) {
        return ApiResponse.conflict(res, error.message);
      }
      
      if (error.message.includes('dealer role')) {
        return ApiResponse.badRequest(res, error.message);
      }
      
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Get manager profile
   * GET /api/users/:id/manager
   */
  async getManagerProfile(req, res) {
    try {
      const { id } = req.params;
      const manager = await UserService.getManagerProfile(id);
      
      return ApiResponse.success(res, manager, 'Manager profile retrieved successfully');
    } catch (error) {
      logger.error('Get manager profile error:', error);
      
      if (error.message === 'Manager profile not found') {
        return ApiResponse.notFound(res, error.message);
      }
      
      return ApiResponse.internalServerError(res, error.message);
    }
  }

  /**
   * Get dealer profile
   * GET /api/users/:id/dealer
   */
  async getDealerProfile(req, res) {
    try {
      const { id } = req.params;
      const dealer = await UserService.getDealerProfile(id);
      
      return ApiResponse.success(res, dealer, 'Dealer profile retrieved successfully');
    } catch (error) {
      logger.error('Get dealer profile error:', error);
      
      if (error.message === 'Dealer profile not found') {
        return ApiResponse.notFound(res, error.message);
      }
      
      return ApiResponse.internalServerError(res, error.message);
    }
  }

  /**
   * Update manager profile
   * PUT /api/users/:id/manager
   */
  async updateManagerProfile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const manager = await UserService.updateManagerProfile(id, updateData);
      
      return ApiResponse.success(res, manager, 'Manager profile updated successfully');
    } catch (error) {
      logger.error('Update manager profile error:', error);
      
      if (error.message === 'Manager profile not found') {
        return ApiResponse.notFound(res, error.message);
      }
      
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Update dealer profile
   * PUT /api/users/:id/dealer
   */
  async updateDealerProfile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const dealer = await UserService.updateDealerProfile(id, updateData);
      
      return ApiResponse.success(res, dealer, 'Dealer profile updated successfully');
    } catch (error) {
      logger.error('Update dealer profile error:', error);
      
      if (error.message === 'Dealer profile not found') {
        return ApiResponse.notFound(res, error.message);
      }
      
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Get all managers with filters
   * GET /api/managers
   */
  async getManagers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        storeType, 
        isVerified, 
        city 
      } = req.query;
      
      const filters = {};
      if (storeType) filters.storeType = storeType;
      if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
      if (city) filters.city = city;
      
      const result = await UserService.getManagers(filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, result, 'Managers retrieved successfully');
    } catch (error) {
      logger.error('Get managers error:', error);
      return ApiResponse.internalServerError(res, error.message);
    }
  }

  /**
   * Get all dealers with filters
   * GET /api/dealers
   */
  async getDealers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        dealerType, 
        isVerified, 
        city, 
        specialty 
      } = req.query;
      
      const filters = {};
      if (dealerType) filters.dealerType = dealerType;
      if (isVerified !== undefined) filters.isVerified = isVerified === 'true';
      if (city) filters.city = city;
      if (specialty) filters.specialty = specialty;
      
      const result = await UserService.getDealers(filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, result, 'Dealers retrieved successfully');
    } catch (error) {
      logger.error('Get dealers error:', error);
      return ApiResponse.internalServerError(res, error.message);
    }
  }
}

module.exports = new UserController(); 