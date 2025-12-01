const User = require('../models/User');
const Manager = require('../models/Manager');
const logger = require('../utils/logger');

class ManagerService {

  /**
   * Create manager profile
   */
  async createManagerProfile(userId, managerData) {
    try {
      // Check if user exists and has manager role
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      //update user to manager role
      user.role = 'MANAGER';
      await user.save();


      // Check if manager profile already exists
      const existingManager = await Manager.findOne({ userId });
      if (existingManager) {
        throw new Error('Manager profile already exists for this user');
      }

      // Create manager profile
      const manager = new Manager({
        userId,
        ...managerData
      });
      await manager.save();

      logger.info(`Manager profile created for user: ${user.email}`);

      return manager.getPublicProfile();
    } catch (error) {
      logger.error('Error creating manager profile:', error);
      throw error;
    }
  }



  /**
   * Get manager profile
   */
  async getManagerProfile(userId) {
    try {
      const manager = await Manager.findOne({ userId }).populate('userId', 'firstName lastName email phone');
      if (!manager) {
        throw new Error('Manager profile not found');
      }
      return manager.getPublicProfile();
    } catch (error) {
      logger.error('Error getting manager profile:', error);
      throw error;
    }
  }


  /**
   * Update manager profile
   */
  async updateManagerProfile(userId, updateData) {
    try {
      const manager = await Manager.findOne({ userId });
      if (!manager) {
        throw new Error('Manager profile not found');
      }

      Object.assign(manager, updateData);
      await manager.save();

      logger.info(`Manager profile updated for user: ${userId}`);

      return manager.getPublicProfile();
    } catch (error) {
      logger.error('Error updating manager profile:', error);
      throw error;
    }
  }


  /**
   * Get all managers with filters
   */
  async getManagers(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (filters.storeType) query.storeType = filters.storeType;
      if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
      if (filters.city) query['storeAddress.city'] = { $regex: filters.city, $options: 'i' };

      const managers = await Manager.find(query)
        .populate('userId', 'firstName lastName email phone status')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Manager.countDocuments(query);

      return {
        managers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting managers:', error);
      throw error;
    }
  }

}

module.exports = new ManagerService(); 