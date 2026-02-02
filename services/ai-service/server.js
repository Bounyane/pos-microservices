require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const logger = require('./src/utils/logger');
const cashbackService = require('./src/services/cashbackService');

const PROTO_PATH = path.join(__dirname, 'cashback.proto');

// Load proto file
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const cashbackProto = grpc.loadPackageDefinition(packageDefinition).cashback;

// Create gRPC server
const server = new grpc.Server();

// Add service implementation
server.addService(cashbackProto.CashbackService.service, {
    GetCashback: cashbackService.getCashback
});

// Start server
const PORT = process.env.GRPC_PORT || 50052;
const HOST = '0.0.0.0';

server.bindAsync(
    `${HOST}:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            logger.error(`Server error: ${error.message}`);
            return;
        }
        logger.info(`AI Service gRPC server running on port ${port}`);
        server.start();
    }
);

// Handle shutdown gracefully
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing gRPC server');
    server.tryShutdown(() => {
        logger.info('gRPC server closed');
    });
});
