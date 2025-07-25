const database = require('../config/database');
const config = require('../config/app');

class Session {
  constructor() {
    this.redisClient = null;
  }

  // Initialize Redis client
  async init() {
    this.redisClient = database.getClient();
  }

  // Store user session in Redis
  async store(uid, sessionData) {
    try {
      if (!this.redisClient) {
        await this.init();
      }
      
      await this.redisClient.setEx(
        `session:${uid}`, 
        config.sessionExpiration, 
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error('Error storing session:', error);
      throw error;
    }
  }

  // Get user session from Redis
  async get(uid) {
    try {
      if (!this.redisClient) {
        await this.init();
      }
      
      const sessionData = await this.redisClient.get(`session:${uid}`);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Remove user session from Redis
  async remove(uid) {
    try {
      if (!this.redisClient) {
        await this.init();
      }
      
      await this.redisClient.del(`session:${uid}`);
    } catch (error) {
      console.error('Error removing session:', error);
      throw error;
    }
  }

  // Get all active sessions (for admin)
  async getAllSessions() {
    try {
      if (!this.redisClient) {
        await this.init();
      }
      
      const keys = await this.redisClient.keys('session:*');
      const sessions = [];
      
      for (const key of keys) {
        const sessionData = await this.redisClient.get(key);
        if (sessionData) {
          sessions.push(JSON.parse(sessionData));
        }
      }
      
      return sessions;
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  // Check if session is active
  async isActive(uid) {
    const session = await this.get(uid);
    return session && session.isActive;
  }

  // Update session data
  async update(uid, updates) {
    const currentSession = await this.get(uid);
    if (!currentSession) {
      throw new Error('Session not found');
    }

    const updatedSession = { ...currentSession, ...updates };
    await this.store(uid, updatedSession);
    return updatedSession;
  }

  // Get session count
  async getCount() {
    try {
      if (!this.redisClient) {
        await this.init();
      }
      
      const keys = await this.redisClient.keys('session:*');
      return keys.length;
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  }
}

module.exports = new Session(); 