const User = require('../models/User');
const Manager = require('../models/Manager');
const Dealer = require('../models/Dealer');
const logger = require('../utils/logger');

class UserService {
  /**
   * Register a new user
   */
  async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { phone: userData.phone }]
      });

      if (existingUser) {
        throw new Error('User with this email or phone already exists');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      logger.info(`New user registered: ${user.email} with role: ${user.role}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user.getPublicProfile();
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      return user.getPublicProfile();
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if email or phone is being updated and if it's already taken
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findByEmail(updateData.email);
        if (existingUser) {
          throw new Error('Email already in use');
        }
      }

      if (updateData.phone && updateData.phone !== user.phone) {
        const existingUser = await User.findByPhone(updateData.phone);
        if (existingUser) {
          throw new Error('Phone number already in use');
        }
      }

      // Update user
      Object.assign(user, updateData);
      await user.save();

      logger.info(`User updated: ${user.email}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete by setting status to REMOVED
      user.status = 'REMOVED';
      await user.save();

      logger.info(`User deleted: ${user.email}`);

      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination and filters
   */
  async getUsers(filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const query = {};

      // Apply filters
      if (filters.role) query.role = filters.role;
      if (filters.status) query.status = filters.status;
      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId, status) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.status = status;
      await user.save();

      logger.info(`User status updated: ${user.email} -> ${status}`);

      return user.getPublicProfile();
    } catch (error) {
      logger.error('Error updating user status:', error);
      throw error;
    }
  }

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

module.exports = new UserService(); 