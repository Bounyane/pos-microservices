const AuthService = require('../services/AuthService');
const config = require('../config/app');

class AuthController {
  // Login user
  async login(req, res) {
    try {
      const result = await AuthService.login(req.body);
      
      console.log(`User ${req.body.email} logged in successfully`);
      
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      
      res.status(401).json({ 
        error: 'Authentication failed', 
        details: config.nodeEnv === 'development' ? error.message : undefined 
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const result = await AuthService.logout(req.user.uid);
      
      console.log(`User ${req.user.email} logged out successfully`);
      
      res.json(result);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Validate token
  async validateToken(req, res) {
    try {
      const result = await AuthService.validateToken(req.body.token);
      
      if (result.valid) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ valid: false, error: 'Invalid token' });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const result = await AuthService.refreshToken(req.user.uid);
      
      res.json(result);
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ error: 'Token refresh failed' });
    }
  }
}

module.exports = new AuthController(); 