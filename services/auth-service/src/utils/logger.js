const config = require('../config/app');

class Logger {
  constructor() {
    this.isDevelopment = config.nodeEnv === 'development';
  }

  // Log info messages
  info(message, data = null) {
    const logData = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data })
    };
    
    console.log(JSON.stringify(logData));
  }

  // Log error messages
  error(message, error = null) {
    const logData = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...(error && { error: error.message || error })
    };
    
    console.error(JSON.stringify(logData));
  }

  // Log warning messages
  warn(message, data = null) {
    const logData = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data })
    };
    
    console.warn(JSON.stringify(logData));
  }

  // Log debug messages (only in development)
  debug(message, data = null) {
    if (!this.isDevelopment) return;
    
    const logData = {
      level: 'DEBUG',
      timestamp: new Date().toISOString(),
      message,
      ...(data && { data })
    };
    
    console.debug(JSON.stringify(logData));
  }

  // Log authentication events
  auth(event, user, details = null) {
    const logData = {
      level: 'AUTH',
      timestamp: new Date().toISOString(),
      event,
      user: user.email || user.uid,
      ...(details && { details })
    };
    
    console.log(JSON.stringify(logData));
  }

  // Log API requests
  request(method, path, user = null, statusCode = null) {
    const logData = {
      level: 'REQUEST',
      timestamp: new Date().toISOString(),
      method,
      path,
      ...(user && { user: user.email || user.uid }),
      ...(statusCode && { statusCode })
    };
    
    console.log(JSON.stringify(logData));
  }
}

module.exports = new Logger(); 