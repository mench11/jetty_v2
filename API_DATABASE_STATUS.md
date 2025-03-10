# API and Database Integration Status

This document provides an overview of the current state of API integration and database usage in the Jetty v2 application.

## Current Status

The application has been refactored to use a modular API structure with separate route files for different entities. The frontend has been updated to use real API endpoints instead of simulated database operations. However, there appears to be a discrepancy between what's displayed in the frontend and what's stored in the database.

## Database Tables and API Routes

| Entity | API Route File | Database Table | Status |
|--------|---------------|----------------|--------|
| Users | `/src/routes/userRoutes.ts` | `users` | ✅ API routes implemented<br>❓ Database table may be empty |
| Chatbots | `/src/routes/chatbotRoutes.ts` | `chatbots` | ✅ API routes implemented<br>❓ Database table may be empty |
| Chat Sessions | `/src/routes/chatSessionRoutes.ts` | `chat_sessions` | ✅ API routes implemented<br>❓ Database table may be empty |
| Chat Messages | `/src/routes/chatMessageRoutes.ts` | `chat_messages` | ✅ API routes implemented<br>❓ Database table may be empty |
| API Tokens | `/src/routes/apiTokenRoutes.ts` | `api_tokens` | ✅ API routes implemented<br>❓ Database table may be empty |

## Frontend Pages and API Integration

### Pages Using Real API Endpoints

The following pages have been updated to use real API endpoints:

1. **ChatbotFormPage.tsx**
   - Uses `chatbotApi.getById()`, `chatbotApi.update()`, and `chatbotApi.create()`
   - Currently displays data but may be using fallback mock data

2. **ChatbotManagementPage.tsx**
   - Uses `chatbotApi.getAll()` and `chatbotApi.delete()`
   - Currently displays data but may be using fallback mock data

3. **UserAccessManagementPage.tsx**
   - Uses `userApi.getAll()` and `userApi.delete()`
   - Falls back to mock data if the API returns empty results

### Data Discrepancy Issue

The frontend is displaying data even though the database appears to be empty. This is likely due to one of the following reasons:

1. **Fallback to Mock Data**: The frontend components are designed to fall back to mock data if the API returns empty results. This is particularly evident in the `UserAccessManagementPage.tsx` where there's explicit code to use mock data if the API call fails or returns empty.

2. **Database Connection Issues**: The API routes might not be correctly connecting to the database, or the database tables might not be properly initialized.

3. **Data Seeding**: The database might need to be seeded with initial data.

## Next Steps

To fully integrate the frontend with the database, the following steps are recommended:

1. **Verify Database Connection**: Ensure that the database connection parameters in the `.env` file are correct.

2. **Initialize Database Tables**: Create the necessary database tables if they don't exist.

3. **Seed Initial Data**: Populate the database with initial data for testing.

4. **Remove Mock Data Fallbacks**: Once the database is properly set up and populated, remove the mock data fallbacks from the frontend components.

5. **Implement Remaining API Functionality**: Ensure all required API endpoints are implemented and working correctly.

6. **Add Error Handling**: Improve error handling in both the frontend and backend to provide better feedback to users.

## Pages Requiring Further API Integration

The following pages may need additional API integration:

1. **Chat Interface Pages**: These pages likely need to integrate with the chat session and chat message APIs.

2. **User Profile Pages**: These pages may need to integrate with the user API for profile management.

3. **Admin Dashboard**: This page may need to integrate with multiple APIs to display comprehensive statistics and management options.

## Database Schema Recommendations

Based on the current implementation, the following database schema is recommended:

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type ENUM('free', 'premium', 'admin') NOT NULL,
  access_expiry DATETIME,
  created_at DATETIME NOT NULL,
  last_active DATETIME,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE chatbots (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  daily_limit INT NOT NULL,
  max_tokens INT NOT NULL,
  has_file_access BOOLEAN NOT NULL,
  system_prompt TEXT NOT NULL,
  welcome_message TEXT,
  knowledge_base TEXT,
  knowledge_base_enabled BOOLEAN NOT NULL,
  response_language VARCHAR(10) NOT NULL,
  temperature FLOAT NOT NULL,
  emoji_mode BOOLEAN NOT NULL,
  role TEXT,
  principles TEXT,
  interaction_examples TEXT
);

CREATE TABLE chat_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  chatbot_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id)
);

CREATE TABLE chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);

CREATE TABLE api_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME,
  last_used_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_chatbot_access (
  user_id VARCHAR(255) NOT NULL,
  chatbot_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (user_id, chatbot_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id)
);
```

This schema should be implemented to ensure proper database functionality.
