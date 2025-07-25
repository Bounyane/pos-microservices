const bcrypt = require('bcryptjs');
const config = require('../config/app');

class User {
  constructor() {
    // In-memory user store (in production, this should be a database)
    this.users = new Map();
  }

  // Generate unique user ID
  generateUID() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Create a new user
  async create(userData) {
    const { email, password, role = 'CUSTOMER' } = userData;

    // Check if user already exists
    const existingUser = this.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.saltRounds);

    // Create new user
    const uid = this.generateUID();
    const newUser = {
      uid,
      email,
      password: hashedPassword,
      role,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    this.users.set(uid, newUser);
    return newUser;
  }

  // Find user by email
  findByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // Find user by UID
  findByUID(uid) {
    return this.users.get(uid);
  }

  // Update user
  update(uid, updates) {
    const user = this.users.get(uid);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(uid, updatedUser);
    return updatedUser;
  }

  // Update user role
  updateRole(uid, role) {
    return this.update(uid, { role });
  }

  // Update last login
  updateLastLogin(uid) {
    return this.update(uid, { lastLogin: new Date().toISOString() });
  }

  // Verify password
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }

  // Get all users (for admin)
  getAllUsers() {
    return Array.from(this.users.values()).map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
  }

  // Delete user
  delete(uid) {
    return this.users.delete(uid);
  }

  // Get user count
  getCount() {
    return this.users.size;
  }
}

module.exports = new User(); 