# AI Education Platform SQL Setup Guide

## Overview

This guide details the SQL setup process for the AI Education Platform's MariaDB/MySQL database. The SQL files are located in the `supabase/migrations` directory.

## Prerequisites

- MariaDB 10.3+ or MySQL 8.0+
- phpMyAdmin
- Database administration privileges

## Database Creation

1. In phpMyAdmin:
   - Click "New" in the left sidebar
   - Enter database name: `ai_education_platform`
   - Select collation: `utf8mb4_unicode_ci`
   - Click "Create"

Or using SQL:
```sql
CREATE DATABASE ai_education_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_education_platform;
```

## SQL Files Execution Order

Execute the following SQL files in the exact order specified. These files are located in the `supabase/migrations` directory:

### 1. `20250309065524_sweet_bonus.sql`
**Purpose**: Core user management system
- Creates users table with UUID support
- Sets up user preferences
- Establishes user types and statuses
- **MUST BE RUN FIRST** as other tables reference user IDs

### 2. `20250309065538_snowy_meadow.sql`
**Purpose**: Chatbot configuration system
- Defines chatbot settings and configurations
- Sets up chatbot access controls
- **RUN SECOND** as chat history depends on chatbot configurations

### 3. `20250309065553_shrill_marsh.sql`
**Purpose**: Message and session management
- Creates chat sessions table
- Sets up chat messages storage
- Manages chat tags and metadata

### 4. `20250309065606_billowing_frog.sql`
**Purpose**: API integration management
- Creates API tokens table
- Manages provider integrations
- Handles token usage tracking

### 5. `20250309065611_patient_brook.sql`
**Purpose**: User types and permissions
- Defines user type definitions
- Sets up page access permissions
- Completes the access control system

## Execution Instructions

### Using phpMyAdmin

1. Log into phpMyAdmin
2. Select the `ai_education_platform` database
3. Go to the "Import" tab
4. For each SQL file:
   - Click "Choose File"
   - Select the SQL file in the order listed above
   - Set these options:
     - Character set: `utf8mb4`
     - Format: `SQL`
     - "Enable foreign key checks" should be checked
   - Click "Go" to execute
   - **Important**: Wait for each file to complete before proceeding to the next

### Common Issues and Solutions

#### 1. UUID Generation
If you see errors about UUID functions:
```sql
-- Check if UUID function is available
SELECT UUID();

-- If not available, you may need to install it:
INSTALL SONAME 'udf_sys_vars';
```

#### 2. ENUM Type Issues
If you see ENUM errors, ensure you're using MariaDB 10.3+ or MySQL 8.0+. The migrations use ENUM types extensively for:
- User status: `('active', 'inactive', 'suspended')`
- User types: `('free', 'premium', 'admin')`
- Learning levels: `('beginner', 'intermediate', 'advanced')`
- Message roles: `('user', 'assistant', 'system')`

#### 3. Foreign Key Constraints
If you encounter foreign key issues:
```sql
-- Check foreign key status
SHOW ENGINE INNODB STATUS;

-- Temporarily disable foreign key checks if needed
SET FOREIGN_KEY_CHECKS = 0;
-- Run your migrations
SET FOREIGN_KEY_CHECKS = 1;
```

#### 4. Character Set Issues
```sql
-- Verify database character set
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM INFORMATION_SCHEMA.SCHEMATA 
WHERE SCHEMA_NAME = 'ai_education_platform';

-- Fix if needed
ALTER DATABASE ai_education_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Verification Steps

After executing all SQL files, verify the setup:

1. Check tables existence:
```sql
SHOW TABLES;
```

2. Verify foreign key constraints:
```sql
SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME IS NOT NULL
AND TABLE_SCHEMA = 'ai_education_platform';
```

3. Check table structures:
```sql
DESCRIBE users;
DESCRIBE chatbots;
DESCRIBE chat_sessions;
DESCRIBE api_tokens;
DESCRIBE user_types;
```

## Security Notes

1. The system uses UUID for primary keys (CHAR(36))
2. Passwords are stored as hashes
3. All sensitive fields use appropriate encryption
4. Access control is implemented at the application level

## Next Steps

After successful database setup:

1. Create application user:
```sql
CREATE USER 'ai_education_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ai_education_platform.* TO 'ai_education_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Configure backup strategy:
```bash
# Example backup command
mysqldump -u root -p ai_education_platform > backup_$(date +%Y%m%d).sql
```

3. Update application environment variables with database credentials

4. Proceed with backend deployment