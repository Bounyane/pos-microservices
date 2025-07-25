# User Service

A microservice for user management in the POS system, built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Complete CRUD operations for users
- **Role-based Profiles**: Support for different user roles (dealer, manager, customer, admin, delivery, waiter)
- **Manager Profiles**: Store management with detailed business information
- **Dealer Profiles**: Individual and company dealer profiles with ratings
- **MongoDB Integration**: Robust database with Mongoose ODM
- **Validation**: Comprehensive input validation using Joi
- **Security**: Password hashing, rate limiting, and CORS protection
- **Logging**: Structured logging with Winston
- **Health Checks**: Docker health check integration

## User Schema

### User Model
- `id`: Unique identifier
- `firstName`: User's first name (2-50 characters)
- `lastName`: User's last name (2-50 characters)
- `phone`: Unique phone number
- `email`: Unique email address
- `password`: Hashed password (minimum 6 characters)
- `role`: User role (dealer, manager, customer, admin, delivery, waiter)
- `status`: Account status (ACTIVE, REFUSED, REMOVED, PENDING)
- `profileImage`: Optional profile image URL
- `isEmailVerified`: Email verification status
- `isPhoneVerified`: Phone verification status
- `lastLogin`: Last login timestamp
- `createdAt`, `updatedAt`: Timestamps

### Manager Model
- `userId`: Reference to User model
- `storeType`: Type of store (restaurant, supermarket, cafe, etc.)
- `storeName`: Name of the store
- `storeAddress`: Complete address information
- `storePhone`: Store contact phone
- `storeEmail`: Store contact email
- `businessLicense`: Business license number
- `taxId`: Tax identification number
- `storeDescription`: Optional store description
- `operatingHours`: Weekly operating hours
- `isVerified`: Verification status
- `verificationDate`: Date of verification

### Dealer Model
- `userId`: Reference to User model
- `dealerType`: Type of dealer (individual or company)
- `companyName`: Company name (required for company type)
- `companyRegistrationNumber`: Registration number (required for company type)
- `businessAddress`: Complete business address
- `businessPhone`: Business contact phone
- `businessEmail`: Business contact email
- `taxId`: Tax identification number
- `businessLicense`: Business license number
- `businessDescription`: Optional business description
- `specialties`: Array of business specialties
- `serviceAreas`: Array of service areas
- `yearsInBusiness`: Years in business
- `certifications`: Array of professional certifications
- `rating`: Average rating and count
- `isVerified`: Verification status
- `verificationDate`: Date of verification

## API Endpoints

### User Management

#### Register User
```
POST /api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "CUSTOMER"
}
```

#### Get All Users
```
GET /api/users?page=1&limit=10&role=customer&status=ACTIVE&search=john
```

#### Get User by ID
```
GET /api/users/:id
```

#### Get User by Email
```
GET /api/users/email/:email
```

#### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### Update User Status
```
PATCH /api/users/:id/status
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

#### Delete User
```
DELETE /api/users/:id
```

### Manager Profiles

#### Create Manager Profile
```
POST /api/users/:id/manager
Content-Type: application/json

{
  "storeType": "restaurant",
  "storeName": "John's Restaurant",
  "storeAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "storePhone": "+1234567890",
  "storeEmail": "contact@johnsrestaurant.com",
  "businessLicense": "LIC123456",
  "taxId": "TAX123456"
}
```

#### Get Manager Profile
```
GET /api/users/:id/manager
```

#### Update Manager Profile
```
PUT /api/users/:id/manager
Content-Type: application/json

{
  "storeName": "John's Updated Restaurant",
  "storeDescription": "Updated description"
}
```

#### Get All Managers
```
GET /api/managers?page=1&limit=10&storeType=restaurant&isVerified=true&city=New York
```

### Dealer Profiles

#### Create Dealer Profile
```
POST /api/users/:id/dealer
Content-Type: application/json

{
  "dealerType": "company",
  "companyName": "ABC Company",
  "companyRegistrationNumber": "REG123456",
  "businessAddress": {
    "street": "456 Business Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "US"
  },
  "businessPhone": "+1234567890",
  "businessEmail": "contact@abccompany.com",
  "taxId": "TAX123456",
  "businessLicense": "LIC123456",
  "specialties": ["Electronics", "Computers"],
  "serviceAreas": [
    {
      "city": "Los Angeles",
      "state": "CA",
      "country": "US"
    }
  ]
}
```

#### Get Dealer Profile
```
GET /api/users/:id/dealer
```

#### Update Dealer Profile
```
PUT /api/users/:id/dealer
Content-Type: application/json

{
  "businessDescription": "Updated business description",
  "specialties": ["Electronics", "Computers", "Software"]
}
```

#### Get All Dealers
```
GET /api/dealers?page=1&limit=10&dealerType=company&isVerified=true&city=Los Angeles&specialty=Electronics
```

### Health Check
```
GET /api/health
```

## Environment Variables

```env
# Server Configuration
PORT=8082
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/pos_users?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd services/user-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Or using local MongoDB installation
   mongod
   ```

5. **Run the service**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Docker

### Build and run with Docker Compose
```bash
# From the infrastructure directory
docker-compose up user-service
```

### Build individual container
```bash
docker build -t pos-user-service .
docker run -p 8082:8082 pos-user-service
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Validation Rules

### User Registration
- `firstName`: 2-50 characters, required
- `lastName`: 2-50 characters, required
- `email`: Valid email format, required, unique
- `phone`: Valid phone format, required, unique
- `password`: Minimum 6 characters, required
- `role`: Must be one of: dealer, manager, customer, admin, delivery, waiter

### Manager Profile
- `storeType`: Must be one of: restaurant, supermarket, cafe, bakery, pharmacy, clothing, electronics, other
- `storeName`: 2-100 characters, required
- `storeAddress`: Complete address object, required
- `storePhone`: Valid phone format, required
- `storeEmail`: Valid email format, required
- `businessLicense`: Required
- `taxId`: Required

### Dealer Profile
- `dealerType`: Must be 'individual' or 'company'
- `companyName`: Required if dealerType is 'company'
- `companyRegistrationNumber`: Required if dealerType is 'company'
- `businessAddress`: Complete address object, required
- `businessPhone`: Valid phone format, required
- `businessEmail`: Valid email format, required
- `taxId`: Required
- `businessLicense`: Required

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **Input Validation**: Comprehensive validation using Joi
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers middleware
- **Error Handling**: Secure error responses without exposing internals

## Logging

The service uses Winston for structured logging with the following features:
- File-based logging for errors and combined logs
- Console logging in development
- Request logging with IP and user agent
- Error logging with stack traces
- Log rotation with size limits

## Health Checks

The service includes health check endpoints for Docker and load balancer integration:
- `/api/health`: Returns service status
- Docker health check: Uses `healthcheck.js` script

## Performance

- **Database Indexing**: Optimized indexes on frequently queried fields
- **Pagination**: Built-in pagination for list endpoints
- **Query Optimization**: Efficient MongoDB queries with proper projections
- **Connection Pooling**: MongoDB connection pooling for better performance

## Monitoring

The service is designed to work with monitoring systems:
- Health check endpoints
- Structured logging
- Error tracking
- Performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details 