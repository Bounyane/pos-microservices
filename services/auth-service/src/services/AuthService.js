const User = require('../models/User');
const Session = require('../models/Session');
const JWTService = require('./JWTService');

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Find user by email
      const user = User.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Verify password
      const isPasswordValid = await User.verifyPassword(user, password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Update last login
      User.updateLastLogin(user.uid);
      
      // Generate JWT token
      const token = JWTService.generateToken(user);
      
      // Store session
      const sessionData = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        lastLogin: new Date().toISOString(),
        isActive: true
      };
      
      await Session.store(user.uid, sessionData);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            uid: user.uid,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            lastLogin: user.lastLogin
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async logout(uid) {
    try {
      await Session.remove(uid);
      
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate token
  async validateToken(token) {
    try {
      // Verify JWT token
      const decoded = JWTService.verifyToken(token);
      
      // Check if session exists and is active
      const sessionData = await Session.get(decoded.uid);
      
      if (!sessionData || !sessionData.isActive) {
        throw new Error('Session expired or invalid');
      }
      
      return {
        valid: true,
        user: {
          uid: decoded.uid,
          email: decoded.email,
          role: decoded.role
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Refresh token
  async refreshToken(uid) {
    try {
      // Get user from database
      const user = User.findByUID(uid);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new JWT token
      const newToken = JWTService.generateToken(user);
      
      // Update session
      const sessionData = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        lastRefresh: new Date().toISOString(),
        isActive: true
      };
      
      await Session.store(user.uid, sessionData);
      
      return {
        success: true,
        token: newToken,
        user: {
          uid: user.uid,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService(); 