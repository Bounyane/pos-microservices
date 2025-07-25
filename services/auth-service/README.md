# Auth Service - Core Authentication Microservice

A focused authentication microservice that handles only core authentication operations: login, logout, token validation, and token refresh.

## 🏗️ Architecture Overview

The service follows a **Pure Microservice Architecture** with single responsibility:

```
src/
├── config/          # Configuration files
├── controllers/     # HTTP request handlers
├── models/          # Data models and business logic
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── services/        # Business logic services
├── utils/           # Utility functions
└── tests/           # Test files
```

## 📁 Project Structure

```
services/auth-service/
├── src/
│   ├── config/
│   │   ├── app.js           # Application configuration
│   │   └── database.js      # Database connection setup
│   ├── controllers/
│   │   └── authController.js # Core authentication endpoints
│   ├── models/
│   │   ├── User.js          # User data model
│   │   └── Session.js       # Session management model
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   └── validation.js    # Request validation middleware
│   ├── routes/
│   │   └── authRoutes.js    # Route definitions
│   ├── services/
│   │   ├── AuthService.js   # Authentication business logic
│   │   └── JWTService.js    # JWT token management
│   ├── utils/
│   │   ├── logger.js        # Logging utility
│   │   └── response.js      # Standardized response helpers
│   └── tests/
│       └── auth.test.js     # API tests
├── server.js                # Application entry point
├── package.json
└── README.md
```

## 🚀 Features

- **User Login**: Secure authentication with bcryptjs
- **User Logout**: Session termination
- **Token Validation**: JWT token verification for other services
- **Token Refresh**: Automatic token refresh mechanism
- **Session Management**: Redis-based session storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **Health Checks**: Service health monitoring

## 🛠️ Technology Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Authentication**: JWT + bcryptjs
- **Session Storage**: Redis
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Custom validation middleware
- **Testing**: Jest + Supertest

## 📋 API Endpoints

### Core Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| POST | `/api/auth/validate` | Validate token | No |
| POST | `/api/auth/refresh` | Refresh token | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=8081
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Redis server running
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the service:**
```bash
# Development
npm run dev

# Production
npm start
```

### Docker

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Microservice Responsibilities

### ✅ **What This Service Handles**

- **User Authentication**: Login with email/password
- **Session Management**: Logout and session termination
- **Token Management**: JWT generation, validation, and refresh
- **Token Validation**: For other microservices

### ❌ **What This Service Does NOT Handle**

- **User Registration**: Handled by User Service
- **User Management**: User CRUD operations (User Service)
- **Profile Management**: User profiles (User Service)
- **Role Management**: Role assignments (Admin Service)
- **Admin Operations**: System administration (Admin Service)
- **Business Logic**: Application-specific logic (respective services)

## 🔒 Security Features

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: Secure token generation with configurable expiration
- **Rate Limiting**: Prevents brute force attacks
- **Session Management**: Redis-based session storage with automatic expiration
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers middleware
- **Input Validation**: Comprehensive request validation

## 📋 API Examples

### Login User
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Logout User
```bash
curl -X POST http://localhost:8081/api/auth/logout \
  -H "Authorization: Bearer your-jwt-token"
```

### Validate Token
```bash
curl -X POST http://localhost:8081/api/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-jwt-token"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:8081/api/auth/refresh \
  -H "Authorization: Bearer your-jwt-token"
```

## 🔄 Microservice Integration

### Token Validation for Other Services

Other microservices can validate tokens by calling the auth service:

```javascript
const response = await fetch('http://auth-service:8081/api/auth/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token: userToken })
});

if (response.ok) {
  const { valid, user } = await response.json();
  // User is authenticated, proceed with business logic
}
```

### Service-to-Service Communication

```javascript
// Example: User Service validating tokens
async function getUserProfile(token) {
  const authResponse = await fetch('http://auth-service:8081/api/auth/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  if (authResponse.ok) {
    const { user } = await authResponse.json();
    // Now fetch user profile from user database
    return await getUserFromDatabase(user.uid);
  }
  
  throw new Error('Invalid token');
}
```

## 🏗️ Service Architecture

### Service Responsibilities

| Service | Responsibilities |
|---------|------------------|
| **Auth Service** | Login, logout, token validation, token refresh |
| **User Service** | User registration, profiles, preferences |
| **Admin Service** | User management, role assignments, system stats |
| **Business Services** | Application-specific logic |

### Data Flow

1. **User Registration**: User Service → Auth Service (for login credentials)
2. **User Login**: Auth Service (validates credentials, generates token)
3. **Token Validation**: Other services → Auth Service
4. **User Logout**: Auth Service (terminates session)

## 🚀 Production Deployment

### Requirements

1. **Database**: Replace in-memory user store with PostgreSQL/MongoDB
2. **Environment Variables**: Use secure, unique JWT secrets
3. **Redis**: Configure Redis with proper security settings
4. **Monitoring**: Add logging and monitoring solutions
5. **SSL/TLS**: Use HTTPS in production
6. **Load Balancing**: Configure load balancer for high availability

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
JWT_SECRET=your-super-secure-production-secret
REDIS_URL=redis://your-redis-server:6379
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## 📝 Development Guidelines

### Code Style

- Use ES6+ features
- Follow consistent naming conventions
- Add JSDoc comments for functions
- Use async/await for asynchronous operations
- Implement proper error handling

### Testing

- Write unit tests for services
- Write integration tests for controllers
- Test all API endpoints
- Maintain good test coverage

### Error Handling

- Use standardized error responses
- Log errors appropriately
- Don't expose sensitive information
- Provide meaningful error messages

## 🔧 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server is running
   - Verify REDIS_URL configuration

2. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration

3. **Rate Limiting**
   - Adjust rate limit configuration
   - Check for abuse patterns

4. **CORS Issues**
   - Verify ALLOWED_ORIGINS configuration
   - Check frontend domain

## 📄 License

MIT License - see LICENSE file for details. 