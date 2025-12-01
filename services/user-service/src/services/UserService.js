const User = require('../models/User');
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
   * Verify user credentials (for gRPC)
   */
  async verifyCredentials(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, userId: '', role: '', error: 'User not found' };
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return { success: false, userId: '', role: '', error: 'Invalid password' };
      }
      return { success: true, userId: user._id.toString(), role: user.role, error: '' };
    } catch (error) {
      logger.error('Error verifying credentials:', error);
      return { success: false, userId: '', role: '', error: 'Internal error' };
    }
  }
}

module.exports = new UserService(); 