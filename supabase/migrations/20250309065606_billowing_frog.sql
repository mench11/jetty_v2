/*
  # Create API Tokens Table

  1. New Tables
    - `api_tokens` - API token management
      - `id` (char(36), primary key)
      - `name` (text)
      - `value` (text)
      - `provider` (enum)
      - `created_at` (timestamp)
      - `last_used` (timestamp)
      - `usage_count` (integer)
      - `status` (enum)

  2. Security
    - Access control should be implemented at the application level
    - Only admin users should be able to manage API tokens
*/

-- Create API tokens table
CREATE TABLE IF NOT EXISTS api_tokens (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  provider ENUM('openai', 'deepseek', 'other') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP NULL,
  usage_count INT DEFAULT 0,
  status ENUM('active', 'inactive', 'revoked') DEFAULT 'active',
  CONSTRAINT positive_usage_count CHECK (usage_count >= 0)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_api_tokens_provider_type ON api_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_api_tokens_status_type ON api_tokens(status);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS before_insert_api_tokens_uuid;

-- Add UUID generation trigger
DELIMITER //

CREATE TRIGGER before_insert_api_tokens_uuid
BEFORE INSERT ON api_tokens
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

DELIMITER ;