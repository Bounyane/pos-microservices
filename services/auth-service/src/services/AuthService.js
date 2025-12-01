const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const Session = require('../models/Session');
const JWTService = require('./JWTService');

const PROTO_PATH = path.join(__dirname, '../../user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(packageDefinition).user;
const grpcClient = new userProto.UserService(
  process.env.USER_SERVICE_GRPC_URL || 'localhost:50051',
  grpc.credentials.createInsecure()
);

class AuthService {
  // Login user
  async login(credentials) {
    try {
      const { email, password } = credentials;
      // Call user-service via gRPC
      const verifyCredentials = () => new Promise((resolve, reject) => {
        grpcClient.VerifyCredentials({ email, password }, (err, response) => {
          if (err) return reject(err);
          resolve(response);
        });
      });
      const result = await verifyCredentials();
      if (!result.success) {
        throw new Error(result.error || 'Invalid credentials');
      }
      // Minimal user info (only userId and email)
      const user = {
        uid: result.userId,
        email,
        role: result.role,
        lastLogin: new Date().toISOString()
      };
      // Generate JWT token
      const token = JWTService.generateToken(user);
      // Store session
      const sessionData = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        isActive: true
      };
      await Session.store(user.uid, sessionData);
      return {
        success: true,
        message: 'Login successful',
        data: {
          token,
          user
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
  async getTokenInfo(uid) {
    try {
      // Check if session exists and is active
      const sessionData = await Session.get(uid);
      
      if (!sessionData || !sessionData.isActive) {
        throw new Error('Session expired or invalid');
      }
      
      return {
        valid: true,
        user: {
          uid: sessionData.uid,
          email: sessionData.email,
          role: sessionData.role
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
  async refreshToken(uid, email = null) {
    try {
      // No user DB, so just use uid and email
      if (!uid) {
        throw new Error('User not found');
      }
      
      // Get existing session to get the role
      const sessionData = await Session.get(uid);
      if (!sessionData || !sessionData.isActive) {
        throw new Error('Session expired or invalid');
      }
      
      // Generate new JWT token
      const user = {
        uid,
        email: email || sessionData.email,
        role: sessionData.role,
      };
      const newToken = JWTService.generateToken(user);
      // Update session
      const updatedSessionData = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        lastRefresh: new Date().toISOString(),
        isActive: true
      };
      await Session.store(user.uid, updatedSessionData);
      return {
        success: true,
        token: newToken,
        user
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService(); 