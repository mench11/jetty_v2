# Database Integration Guide

## Overview

This guide explains how to set up the database for the Jetty v2 application and integrate it with the frontend.

## Database Setup

1. **Run the SQL Script**:
   - Open phpMyAdmin
   - Select your database
   - Go to the "SQL" tab
   - Import the `setup_database.sql` file or copy and paste its contents
   - Click "Go" to execute the SQL

The SQL script will:
- Create all necessary tables with proper relationships
- Add appropriate indexes for performance
- Create triggers for automatic UUID generation
- Insert sample data that matches the frontend mock data

## Database Structure

The database consists of the following tables:

1. **users** - User accounts
2. **user_preferences** - User learning preferences
3. **chatbots** - Chatbot configurations
4. **chat_sessions** - Chat sessions between users and chatbots
5. **chat_messages** - Individual messages in chat sessions
6. **api_tokens** - API authentication tokens
7. **chatbot_access** - Manages which users have access to which chatbots
8. **chat_tags** - Tags for chat sessions
9. **page_permissions** - Page access permissions

## Frontend Integration Status

The frontend has been updated to use the API endpoints instead of simulated database operations. The following components now use real API calls:

1. **ChatbotFormPage.tsx** - Uses `chatbotApi.getById()`, `chatbotApi.update()`, and `chatbotApi.create()`
2. **ChatbotManagementPage.tsx** - Uses `chatbotApi.getAll()` and `chatbotApi.delete()`
3. **UserAccessManagementPage.tsx** - Uses `userApi.getAll()` and `userApi.delete()`

## API Service

The API service (`apiService.ts`) provides the following functionality:

- **Users API**: CRUD operations for users
- **Chatbots API**: CRUD operations for chatbots
- **Chat Sessions API**: CRUD operations for chat sessions
- **Chat Messages API**: Create and retrieve chat messages
- **API Tokens API**: CRUD operations for API tokens

## Troubleshooting

If you encounter issues with the database setup:

1. **Foreign Key Constraints**: The SQL script temporarily disables foreign key checks to allow for clean table creation. If you still encounter constraints issues, ensure you're running the entire script at once.

2. **UUID Generation**: The database uses triggers to automatically generate UUIDs for new records. If you're inserting records manually, you may need to provide UUIDs.

3. **Frontend-Database Mismatch**: If the frontend displays data that doesn't match what's in the database, check if the frontend is falling back to mock data. This happens when API calls return empty results.

## Next Steps

1. **Test the API Endpoints**: Use tools like Postman to test the API endpoints directly.

2. **Update Remaining Frontend Components**: Some frontend components may still need to be updated to use the API endpoints.

3. **Implement Authentication**: Ensure proper authentication is implemented for API access.

4. **Add Error Handling**: Improve error handling in both the frontend and backend.

## Database Diagram

```
users <-- user_preferences
  ^
  |
  v
chatbots
  ^
  |
  v
chat_sessions <-- chat_tags
  ^
  |
  v
chat_messages
```

This diagram shows the main relationships between the core tables in the database.
