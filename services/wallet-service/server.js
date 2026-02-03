require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const messageBroker = require('./src/services/MessageBroker');

// Connect to Database
connectDB();

// Connect to RabbitMQ and start consuming events
messageBroker.connect();

const PORT = process.env.PORT || 8087;

const server = app.listen(PORT, () => {
    logger.info(`Wallet service running on port ${PORT}`);
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.error(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});

module.exports = server;
