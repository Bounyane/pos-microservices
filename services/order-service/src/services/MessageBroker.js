const amqp = require('amqplib');
const logger = require('../utils/logger');

class MessageBroker {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        if (this.connection) return;
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
            this.channel = await this.connection.createChannel();

            // Assert exchanges
            await this.channel.assertExchange('order_events', 'topic', { durable: true });

            logger.info('Connected to RabbitMQ');
        } catch (error) {
            logger.error(`Error connecting to RabbitMQ: ${error.message}`);
            setTimeout(() => this.connect(), 5000);
        }
    }

    async publishEvent(exchange, routingKey, data) {
        if (!this.channel) {
            await this.connect();
        }
        try {
            this.channel.publish(
                exchange,
                routingKey,
                Buffer.from(JSON.stringify(data))
            );
            logger.info(`Published event: ${routingKey}`);
        } catch (error) {
            logger.error(`Error publishing event: ${error.message}`);
        }
    }
}

module.exports = new MessageBroker();
