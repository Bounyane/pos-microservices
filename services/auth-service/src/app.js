const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config/app');
const database = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const logger = require('./utils/logger');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  // Setup middleware
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors({
      origin: config.allowedOrigins,
      credentials: true
    }));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Rate limiting
    const limiter = rateLimit(config.rateLimit);
    this.app.use('/api/', limiter);
    
    // Auth rate limiting (more restrictive)
    const authLimiter = rateLimit(config.authRateLimit);
    this.app.use('/api/auth/', authLimiter);
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.request(req.method, req.path, req.user, res.statusCode);
        logger.debug(`Request completed in ${duration}ms`);
      });
      
      next();
    });
  }

  // Setup routes
  setupRoutes() {
    // Health check route
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        service: 'auth-service', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  // Setup error handling
  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error('Unhandled error:', error);
      
      res.status(500).json({ 
        error: 'Internal server error',
        details: config.nodeEnv === 'development' ? error.message : undefined
      });
    });
  }

  // Initialize the application
  async init() {
    try {
      // Connect to database
      await database.connect();
      logger.info('Database connected successfully');
      
      // Start server
      this.app.listen(config.port, () => {
        logger.info(`Auth Service running on port ${config.port}`);
        logger.info(`Environment: ${config.nodeEnv}`);
        logger.info(`Health check: http://localhost:${config.port}/health`);
      });
      
      // Graceful shutdown
      this.setupGracefulShutdown();
      
    } catch (error) {
      logger.error('Failed to initialize application:', error);
      process.exit(1);
    }
  }

  // Setup graceful shutdown
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      try {
        await database.disconnect();
        logger.info('Database disconnected successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  // Get Express app instance
  getApp() {
    return this.app;
  }
}

module.exports = App; 