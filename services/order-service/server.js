const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
require('dotenv').config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 8084;

const server = app.listen(PORT, () => {
    logger.info(`Order service running on port ${PORT}`);
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
