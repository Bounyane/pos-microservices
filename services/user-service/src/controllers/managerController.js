const ManagerService = require('../services/mangerService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class ManagerController {

  /**
   * Create manager profile
   * POST /api/users/:id/manager
   */
  async createManagerProfile(req, res) {
    try {
      const { id , ...managerData } = req.body;
      const manager = await ManagerService.createManagerProfile(id, managerData);
      
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
   * Get manager profile
   * GET /api/users/:id/manager
   */
  async getManagerProfile(req, res) {
    try {
      const { id } = req.params;
      const manager = await ManagerService.getManagerProfile(id);
      
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
   * Update manager profile
   * PUT /api/users/:id/manager
   */
  async updateManagerProfile(req, res) {
    try {
      const { id, ...updateData } = req.body;
      const manager = await ManagerService.updateManagerProfile(id, updateData);
      
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
      console.log('test test')
      const result = await ManagerService.getManagers(filters, parseInt(page), parseInt(limit));
      
      return ApiResponse.success(res, result, 'Managers retrieved successfully');
    } catch (error) {
      logger.error('Get managers error:', error);
      return ApiResponse.internalServerError(res, error.message);
    }
  }

}

module.exports = new ManagerController(); 