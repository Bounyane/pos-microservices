const JWTService = require('../services/JWTService');
const Session = require('../models/Session');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = JWTService.verifyToken(token);
    
    // Check if session exists in Redis
    const sessionData = await Session.get(decoded.uid);
    
    if (!sessionData || !sessionData.isActive) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};


// Middleware to check if user has specific role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Role '${role}' required` });
    }
    
    next();
  };
};


// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = JWTService.verifyToken(token);
      
      const sessionData = await Session.get(decoded.uid);
      if (sessionData && sessionData.isActive) {
        req.user = decoded;
      }
    }
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    console.debug('Optional auth failed:', error.message);
  }
  
  next();
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth
}; 