# Infrastructure

This directory contains the Docker Compose configuration for the Produify microservices architecture.

## Services

### Infrastructure Services
- **Redis**: In-memory data store for sessions and caching
- **MongoDB**: Primary database for user data

### Application Services
- **API Gateway** (Port 3000): Main entry point with authentication and routing
- **Auth Service** (Port 8081): Authentication and JWT token management
- **User Service** (Port 8082): User management with gRPC server (Port 50051)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Development Mode
```bash
# Start all services with hot reloading
docker-compose up

# Start with specific services
docker-compose up api-gateway auth-service user-service

# Start in background
docker-compose up -d
```

### Production Mode
```bash
# Build and start production services
docker-compose -f docker-compose.yml up --build

# Stop all services
docker-compose down
```

## Service URLs

### API Gateway (Main Entry Point)
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Public Endpoints (No Auth Required)
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /public/users/register` - User registration
- `POST /public/users/:id/manager` - Create manager profile
- `POST /public/users/:id/dealer` - Create dealer profile

### Admin Endpoints (Require Admin Token)
- `GET /admin/users` - Get all users
- `GET /admin/users/:id` - Get user by ID
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user

### Direct Service Access (Development)
- **Auth Service**: http://localhost:8081
- **User Service**: http://localhost:8082
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017

## Environment Variables

Create a `.env` file in the infrastructure directory:

```env
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key

# Service URLs
AUTH_SERVICE_URL=http://auth-service:8081
USER_SERVICE_URL=http://user-service:8082
USER_SERVICE_GRPC_URL=user-service:50051
```

## Development Tools

### Redis Commander (Optional)
Access Redis GUI at http://localhost:8082 when running with dev profile:

```bash
docker-compose --profile dev up redis-commander
```

## Health Checks

All services include health checks:

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs api-gateway
docker-compose logs auth-service
docker-compose logs user-service
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │  Auth Service   │    │  User Service   │
│   (Port 3000)   │◄──►│   (Port 8081)   │◄──►│   (Port 8082)   │
│                 │    │                 │    │   (gRPC 50051)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Redis       │    │    MongoDB      │    │    MongoDB      │
│   (Port 6379)   │    │   (Port 27017)  │    │   (Port 27017)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild specific service
docker-compose build [service-name]

# Remove volumes and restart
docker-compose down -v
docker-compose up --build
```

### Port Conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### gRPC Connection Issues
Ensure the user-service gRPC port (50051) is properly exposed and the auth-service can reach it via the Docker network. 