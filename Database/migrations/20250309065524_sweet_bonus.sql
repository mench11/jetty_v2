/*
  # Create Users Tables

  1. New Tables
    - `users` - Core user table
      - `id` (char(36), primary key)
      - `email` (text)
      - `name` (text)
      - `password_hash` (text)
      - `user_type` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)
      - `status` (enum)

    - `user_preferences` - User preferences
      - `user_id` (char(36), foreign key)
      - `subject` (text)
      - `level` (enum)
      - `learning_style` (enum)
      - `updated_at` (timestamp)

  2. Security
    - Access control should be implemented at the application level
    - Password hashing and validation at application layer
    - Email format validation using CHECK constraint
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type ENUM('free', 'premium', 'admin') NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  CONSTRAINT email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id CHAR(36) PRIMARY KEY,
  subject VARCHAR(100),
  level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  learning_style ENUM('visual', 'auditory', 'reading', 'kinesthetic') DEFAULT 'visual',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS before_insert_users_uuid;

-- Add UUID generation trigger
DELIMITER //

CREATE TRIGGER before_insert_users_uuid
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

DELIMITER ;