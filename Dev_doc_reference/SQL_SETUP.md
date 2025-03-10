# AI Education Platform SQL Setup Guide

## Overview

This guide details the SQL setup process for the AI Education Platform's MySQL database. The SQL files are located in the `supabase/migrations` directory.

## Prerequisites

- MySQL 8.0 or later
- phpMyAdmin (recommended) or MySQL CLI access
- Database administration privileges

## Database Creation

1. Create the database:
```sql
CREATE DATABASE ai_education_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_education_platform;
```

## SQL Files Execution Order

Execute the following SQL files in the exact order specified. These files are located in the `supabase/migrations` directory:

### 1. `20250309065524_sweet_bonus.sql`
**Purpose**: Core user management system
- Creates user authentication tables
- Sets up user preferences
- Establishes base security policies
- **MUST BE RUN FIRST** as other tables reference user IDs

### 2. `20250309065538_snowy_meadow.sql`
**Purpose**: Chatbot configuration system
- Defines chatbot settings
- Establishes access controls
- **RUN SECOND** as chat history depends on chatbot configurations

### 3. `20250309065553_shrill_marsh.sql`
**Purpose**: Message and session management
- Stores chat sessions
- Records message history
- Manages chat metadata

### 4. `20250309065606_billowing_frog.sql`
**Purpose**: API integration management
- Manages API keys
- Controls provider access
- Handles token management

### 5. `20250309065611_patient_brook.sql`
**Purpose**: Role and permission management
- Defines user roles
- Sets up access permissions
- Completes the security system

## Execution Instructions

### Using phpMyAdmin

1. Log into phpMyAdmin
2. Select the `ai_education_platform` database
3. Go to the "Import" tab
4. For each SQL file from the `supabase/migrations` directory:
   - Click "Choose File"
   - Select the SQL file in the order listed above
   - Ensure "Character set" is set to "utf8mb4"
   - Click "Go" to execute
   - Verify no errors in execution
   - Wait for completion before proceeding to next file

### Using MySQL CLI

```bash
# Connect to MySQL
mysql -u root -p

# Create and use database
CREATE DATABASE ai_education_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_education_platform;

# Execute files in order (adjust paths as needed)
source /path/to/supabase/migrations/20250309065524_sweet_bonus.sql
source /path/to/supabase/migrations/20250309065538_snowy_meadow.sql
source /path/to/supabase/migrations/20250309065553_shrill_marsh.sql
source /path/to/supabase/migrations/20250309065606_billowing_frog.sql
source /path/to/supabase/migrations/20250309065611_patient_brook.sql
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

## Common Issues and Solutions

### Issue: Foreign Key Constraint Failure
```sql
-- If you encounter foreign key issues, verify table order:
SHOW CREATE TABLE chat_sessions;
SHOW CREATE TABLE chatbot_access;
```

### Issue: Character Set Problems
```sql
-- Verify proper character set:
SHOW TABLE STATUS;
```

### Issue: Permission Errors
```sql
-- Grant necessary permissions:
GRANT ALL PRIVILEGES ON ai_education_platform.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## Next Steps

After successful database setup:

1. Create application user:
```sql
CREATE USER 'ai_education_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON ai_education_platform.* TO 'ai_education_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Configure backup strategy:
```bash
# Example backup command
mysqldump -u root -p ai_education_platform > backup_$(date +%Y%m%d).sql
```

3. Update application environment variables with database credentials

4. Proceed with backend deployment

## Support

If you encounter any issues during setup:

1. Check the MySQL error log:
```bash
tail -f /var/log/mysql/error.log
```

2. Verify MySQL service status:
```bash
systemctl status mysql
```

3. Check MySQL configuration:
```bash
mysql --help --verbose
```