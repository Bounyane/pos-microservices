
const User = require('../models/User');
const Dealer = require('../models/Dealer');
const logger = require('../utils/logger');

class DealerService {

  /**
   * Create dealer profile
   */
  async createDealerProfile(userId, dealerData) {
    try {
      // Check if user exists and has dealer role
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      //update user to dealer role
      user.role = 'DEALER';
      await user.save();

      // Check if dealer profile already exists
      const existingDealer = await Dealer.findOne({ userId });
      if (existingDealer) {
        throw new Error('Dealer profile already exists for this user');
      }

      // Create dealer profile
      const dealer = new Dealer({
        userId,
        ...dealerData
      });
      await dealer.save();

      logger.info(`Dealer profile created for user: ${user.email}`);

      return dealer.getPublicProfile();
    } catch (error) {
      logger.error('Error creating dealer profile:', error);
      throw error;
    }
  }



  /**
   * Get dealer profile
   */
  async getDealerProfile(userId) {
    try {
      const dealer = await Dealer.findOne({ userId }).populate('userId', 'firstName lastName email phone');
      if (!dealer) {
        throw new Error('Dealer profile not found');
      }
      return dealer.getPublicProfile();
    } catch (error) {
      logger.error('Error getting dealer profile:', error);
      throw error;
    }
  }



  /**
   * Update dealer profile
   */
  async updateDealerProfile(userId, updateData) {
    try {
      const dealer = await Dealer.findOne({ userId });
      if (!dealer) {
        throw new Error('Dealer profile not found');
      }

      Object.assign(dealer, updateData);
      await dealer.save();

      logger.info(`Dealer profile updated for user: ${userId}`);

      return dealer.getPublicProfile();
    } catch (error) {
      logger.error('Error updating dealer profile:', error);
      throw error;
    }
  }



  /**
   * Get all dealers with filters
   */
  async getDealers(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      if (filters.dealerType) query.dealerType = filters.dealerType;
      if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
      if (filters.city) query['businessAddress.city'] = { $regex: filters.city, $options: 'i' };
      if (filters.specialty) query.specialties = { $in: [filters.specialty] };

      const dealers = await Dealer.find(query)
        .populate('userId', 'firstName lastName email phone status')
        .skip(skip)
        .limit(limit)
        .sort({ 'rating.average': -1, 'rating.count': -1 });

      const total = await Dealer.countDocuments(query);

      return {
        dealers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting dealers:', error);
      throw error;
    }
  }

}

module.exports = new DealerService();

