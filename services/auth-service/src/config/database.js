const Redis = require('redis');

class Database {
  constructor() {
    this.redisClient = null;
  }

  async connect() {
    const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
    
    this.redisClient = Redis.createClient({
      url: REDIS_URL
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    await this.redisClient.connect().catch(console.error);
  }

  async disconnect() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  getClient() {
    return this.redisClient;
  }
}

module.exports = new Database(); 