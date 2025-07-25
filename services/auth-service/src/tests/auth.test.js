const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../config/app');

// Import the server app
const app = require('../../server');

describe('Auth Service API - Core Authentication', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Note: In a real microservice architecture, user registration would be handled by a User Service
    // For testing purposes, we'll assume a user already exists in the system
    // In production, you would create test users through a separate User Service
    
    // Simulate login with existing user credentials
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.data.token;
      testUser = loginResponse.body.data.user;
    }
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('auth-service');
    });
  });

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    it('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should validate a valid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({
          token: authToken
        })
        .expect(200);

      expect(response.body.valid).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({
          token: 'invalid.token.here'
        })
        .expect(401);

      expect(response.body.valid).toBe(false);
    });

    it('should reject token validation without token', async () => {
      const response = await request(app)
        .post('/api/auth/validate')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Token is required');
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Route not found');
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should handle invalid authorization format', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should handle expired or invalid tokens', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer expired.token.here')
        .expect(401);

      expect(response.body.error).toBe('Invalid or expired token');
    });
  });
}); 