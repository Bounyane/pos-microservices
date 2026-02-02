const amqp = require('amqplib');
const logger = require('../utils/logger');

class MessageBroker {
    constructor() {
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            logger.info('Connected to RabbitMQ');
        } catch (error) {
            logger.error(`RabbitMQ connection error: ${error.message}`);
            setTimeout(() => this.connect(), 5000);
        }
    }

    async publishEvent(exchange, routingKey, data) {
        try {
            if (!this.channel) {
                await this.connect();
            }

            await this.channel.assertExchange(exchange, 'topic', { durable: true });

            const message = JSON.stringify(data);
            this.channel.publish(exchange, routingKey, Buffer.from(message), {
                persistent: true
            });

            logger.info(`Published event: ${routingKey}`);
        } catch (error) {
            logger.error(`Error publishing event: ${error.message}`);
        }
    }
}

module.exports = new MessageBroker();
