const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const logger = require('../utils/logger');

const PROTO_PATH = path.join(__dirname, '../../cashback.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const cashbackProto = grpc.loadPackageDefinition(packageDefinition).cashback;

class AIServiceClient {
    constructor() {
        const aiServiceUrl = process.env.AI_SERVICE_GRPC_URL || 'ai-service:50052';
        this.client = new cashbackProto.CashbackService(
            aiServiceUrl,
            grpc.credentials.createInsecure()
        );
    }

    async getCashback(orderId, customerId) {
        return new Promise((resolve, reject) => {
            this.client.GetCashback(
                { orderId, customerId },
                (error, response) => {
                    if (error) {
                        logger.error(`gRPC error: ${error.message}`);
                        reject(error);
                    } else {
                        logger.info(`Received cashback: ${response.cashback} for order ${orderId}`);
                        resolve(response.cashback);
                    }
                }
            );
        });
    }
}

module.exports = new AIServiceClient();
