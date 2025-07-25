const jwt = require('jsonwebtoken');
const config = require('../config/app');

class JWTService {
  // Generate JWT token
  generateToken(user) {
    const payload = {
      uid: user.uid,
      email: user.email,
      role: user.role || 'CUSTOMER',
      exp: Math.floor(Date.now() / 1000) + config.jwtExpiration
    };

    return jwt.sign(payload, config.jwtSecret);
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Decode token without verification (for debugging)
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  // Check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  // Get token expiration time
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded ? decoded.exp : null;
    } catch (error) {
      return null;
    }
  }

  // Generate refresh token (optional - for longer sessions)
  generateRefreshToken(user) {
    const payload = {
      uid: user.uid,
      type: 'refresh',
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };

    return jwt.sign(payload, config.jwtSecret);
  }
}

module.exports = new JWTService(); 