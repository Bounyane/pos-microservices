const DealerService = require('../services/DealerService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

class DealerController {
  /**
   * Create dealer profile
   * POST /api/users/:id/dealer
   */
  async createDealerProfile(req, res) {
    try {
      const { id, ...dealerData } = req.body;
      const dealer = await DealerService.createDealerProfile(id, dealerData);

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
   * Get dealer profile
   * GET /api/users/:id/dealer
   */
  async getDealerProfile(req, res) {
    try {
      const { id } = req.params;
      const dealer = await DealerService.getDealerProfile(id);

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
   * Update dealer profile
   * PUT /api/users/:id/dealer
   */
  async updateDealerProfile(req, res) {
    try {
      const { id, ...updateData } = req.body;
      const dealer = await DealerService.updateDealerProfile(id, updateData);

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

      const result = await DealerService.getDealers(filters, parseInt(page), parseInt(limit));

      return ApiResponse.success(res, result, 'Dealers retrieved successfully');
    } catch (error) {
      logger.error('Get dealers error:', error);
      return ApiResponse.internalServerError(res, error.message);
    }
  }
}

module.exports = new DealerController(); 