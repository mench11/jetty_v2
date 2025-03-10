# AI Education Platform Deployment Guide

## Table of Contents
- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Steps](#deployment-steps)

## Overview

This guide covers deploying the AI Education Platform as a production application with:
- MySQL database
- Node.js/Express backend
- React frontend
- OpenAI/DeepSeek AI integration

## System Requirements

### Development Environment
- Node.js 18.x or later
- MySQL 8.0 or later
- Git

### Production Environment
- Linux server (Ubuntu 20.04 LTS recommended)
- Nginx web server
- PM2 process manager
- SSL certificate

## Database Setup

### 1. MySQL Installation
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Database Creation
```sql
CREATE DATABASE ai_education_platform;
USE ai_education_platform;
```

### 3. SQL Files Execution Order

Execute the following SQL files in order through phpMyAdmin or MySQL CLI:

1. `create_users_table.sql`
   - Creates user management tables
   - Required for authentication and user profiles
   - Run first as other tables reference user IDs

2. `create_chatbots_table.sql`
   - Sets up chatbot configuration tables
   - Required for AI assistant functionality
   - Run second as chat history references chatbot IDs

3. `create_chat_history_table.sql`
   - Creates chat session and message tables
   - Depends on both users and chatbots tables
   - Handles message history and analytics

4. `create_api_tokens_table.sql`
   - Manages API keys for different providers
   - Independent table but required for AI integration
   - Controls access to OpenAI and DeepSeek APIs

5. `create_user_types_table.sql`
   - Defines user roles and permissions
   - Updates user management system
   - Controls access to different features

### 4. Database User Setup
```sql
CREATE USER 'ai_education_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON ai_education_platform.* TO 'ai_education_user'@'localhost';
FLUSH PRIVILEGES;
```

## Backend Setup

### 1. Required Backend Features

#### Authentication System
- Implement JWT-based authentication
- Session management
- Password hashing with bcrypt
- Email verification (optional)

```typescript
// Example structure in src/auth/
├── auth/
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── userController.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── roleMiddleware.ts
│   ├── services/
│   │   └── authService.ts
│   └── routes/
│       └── authRoutes.ts
```

#### API Routes Implementation

1. User Management
```typescript
// Required endpoints
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/settings
PUT    /api/users/settings
```

2. Chatbot Management
```typescript
// Required endpoints
GET    /api/chatbots
GET    /api/chatbots/:id
POST   /api/chatbots
PUT    /api/chatbots/:id
DELETE /api/chatbots/:id
GET    /api/chatbots/:id/stats
```

3. Chat History
```typescript
// Required endpoints
GET    /api/chat/history
GET    /api/chat/sessions/:id
POST   /api/chat/sessions
PUT    /api/chat/sessions/:id
DELETE /api/chat/sessions/:id
```

4. AI Integration
```typescript
// Required endpoints
POST   /api/ai/chat
POST   /api/ai/evaluate
POST   /api/ai/generate
GET    /api/ai/models
```

### 2. Backend Dependencies

Required packages for backend:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "openai": "^4.28.0"
  }
}
```

### 3. Backend Security Implementation

1. Request Rate Limiting
2. Input Validation
3. XSS Protection
4. CORS Configuration
5. API Key Management
6. Error Handling

## Frontend Setup

### 1. Frontend Integration

Update API endpoints in frontend:

1. Update API Base URL
```typescript
// src/api/config.ts
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

2. Implement Authentication Headers
```typescript
// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

3. Update API Service Files
- Update all API calls to use the backend endpoints
- Implement error handling
- Add loading states
- Handle token refresh

### 2. Environment Variables

Create `.env` files for different environments:

```env
# .env.development
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000

# .env.production
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_WS_URL=wss://api.yourdomain.com
```

## Environment Configuration

### 1. Backend Environment Variables
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_USER=ai_education_user
DB_PASSWORD=your_strong_password
DB_NAME=ai_education_platform

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# AI Providers
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key

# Security
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 2. Security Headers Configuration
```javascript
// Nginx configuration example
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self';" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Deployment Steps

### 1. Database Deployment
1. Install MySQL on production server
2. Create database and user
3. Execute SQL migration files in order
4. Set up database backups
5. Configure MySQL security settings

### 2. Backend Deployment
1. Set up Node.js environment
2. Install PM2 globally
3. Clone repository
4. Install dependencies
5. Build the application
6. Configure environment variables
7. Start the application with PM2

```bash
npm install -g pm2
git clone <repository-url>
cd <project-directory>
npm install
npm run build
pm2 start ecosystem.config.js
```

### 3. Frontend Deployment
1. Build the frontend application
2. Configure Nginx
3. Set up SSL certificates
4. Deploy static files
5. Configure caching

```bash
# Build frontend
npm run build

# Deploy to Nginx
sudo cp -r build/* /var/www/html/
```

### 4. Monitoring Setup
1. Configure PM2 monitoring
2. Set up logging
3. Configure error tracking
4. Set up performance monitoring
5. Configure alerts

### 5. Backup Strategy
1. Database backups
2. Configuration backups
3. User uploads backups
4. Automated backup scheduling
5. Backup verification

## Post-Deployment

### 1. Testing Checklist
- [ ] Database connections
- [ ] API endpoints
- [ ] Authentication flow
- [ ] AI integration
- [ ] WebSocket connections
- [ ] Error handling
- [ ] Performance testing
- [ ] Security testing

### 2. Monitoring Checklist
- [ ] Server metrics
- [ ] Application logs
- [ ] Error tracking
- [ ] Performance metrics
- [ ] Security monitoring
- [ ] Database monitoring

### 3. Documentation
- [ ] API documentation
- [ ] Database schema
- [ ] Deployment procedures
- [ ] Backup procedures
- [ ] Monitoring procedures
- [ ] Incident response procedures

### 4. Maintenance
- [ ] Regular updates
- [ ] Security patches
- [ ] Performance optimization
- [ ] Database optimization
- [ ] Log rotation
- [ ] Backup verification