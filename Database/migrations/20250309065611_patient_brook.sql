/*
  # Create User Types and Permissions Tables

  1. New Tables
    - `user_types` - User type definitions
      - `id` (char(36), primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `page_permissions` - Page access permissions
      - `user_type_id` (char(36), foreign key)
      - `page_path` (text)
      - `can_access` (boolean)

  2. Security
    - Access control should be implemented at the application level
    - Page access permissions managed through page_permissions table
    - User type names must be unique
*/

-- Create user types table
CREATE TABLE IF NOT EXISTS user_types (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create page permissions table
CREATE TABLE IF NOT EXISTS page_permissions (
  user_type_id CHAR(36),
  page_path VARCHAR(255),
  can_access BOOLEAN DEFAULT false,
  PRIMARY KEY (user_type_id, page_path),
  FOREIGN KEY (user_type_id) REFERENCES user_types(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_types_name ON user_types(name);
CREATE INDEX IF NOT EXISTS idx_page_permissions_access ON page_permissions(can_access);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS before_insert_user_types_uuid;

-- Add UUID generation trigger
DELIMITER //

CREATE TRIGGER before_insert_user_types_uuid
BEFORE INSERT ON user_types
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

DELIMITER ;