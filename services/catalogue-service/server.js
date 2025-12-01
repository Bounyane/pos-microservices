const app = require('./src/app');
const config = require('./src/config/database'); // Using database config for now, or create app config
const logger = require('./src/utils/logger');
require('dotenv').config();

const PORT = process.env.PORT || 8083;

const server = app.listen(PORT, () => {
    logger.info(`Catalogue service running on port ${PORT}`);
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
