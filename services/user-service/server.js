const app = require('./src/app');
const config = require('./src/config/app');
const logger = require('./src/utils/logger');

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = server; 