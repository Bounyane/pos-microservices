require('dotenv').config();

const config = {
  // Server Configuration
  port: process.env.PORT || 8081,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiration: 60 * 60, // 1 hour in seconds
  
  // Redis Configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // CORS Configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:8080'
  ],
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Auth Rate Limiting (more restrictive)
  /*authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 login attempts per windowMs
  },*/
  
  // Session Configuration
  sessionExpiration: 3600, // 1 hour in seconds
  
  // Password Hashing
  saltRounds: 12
};

module.exports = config; 