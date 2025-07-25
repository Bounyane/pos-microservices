const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Import the server app
const app = require('./server');

describe('Auth Service API', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Create a test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword123',
        role: 'CUSTOMER'
      });

    if (registerResponse.status === 201) {
      authToken = registerResponse.body.data.token;
      testUser = registerResponse.body.data.user;
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

  describe('Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          role: 'CUSTOMER'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject registration with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should reject registration with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });
  });

  describe('Login', () => {
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
  });

  describe('Token Validation', () => {
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
  });

  describe('Profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.uid).toBeDefined();
    });

    it('should reject profile request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('Token Refresh', () => {
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
});
