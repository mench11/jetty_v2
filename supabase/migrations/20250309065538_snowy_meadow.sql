/*
  # Create Chatbots Configuration Tables

  1. New Tables
    - `chatbots` - Chatbot configuration
      - `id` (char(36), primary key)
      - `name` (text)
      - `model` (text)
      - `provider` (enum)
      - `daily_limit` (integer)
      - `max_tokens` (integer)
      - `has_file_access` (boolean)
      - `system_prompt` (text)
      - `welcome_message` (text)
      - `knowledge_base` (text)
      - `response_language` (enum)
      - `temperature` (decimal)
      - `emoji_mode` (boolean)
      - `role` (text)
      - `principles` (text)
      - `interaction_examples` (text)
      - `status` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chatbot_access` - User access to chatbots
      - `user_id` (char(36), foreign key)
      - `chatbot_id` (char(36), foreign key)
      - `granted_at` (timestamp)
      - `expires_at` (timestamp)
      - `status` (enum)

  2. Security
    - Access control should be implemented at the application level
    - User access managed through chatbot_access table
    - Temperature validation using CHECK constraint
*/

-- Create chatbots table
CREATE TABLE IF NOT EXISTS chatbots (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100) NOT NULL,
  provider ENUM('openai', 'deepseek', 'other') DEFAULT 'openai',
  daily_limit INT NOT NULL DEFAULT 50,
  max_tokens INT NOT NULL DEFAULT 4000,
  has_file_access BOOLEAN DEFAULT false,
  system_prompt TEXT,
  welcome_message TEXT,
  knowledge_base TEXT,
  response_language ENUM('zh-HK', 'en', 'zh-CN', 'zh-TW') DEFAULT 'zh-TW',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  emoji_mode BOOLEAN DEFAULT false,
  role VARCHAR(100),
  principles TEXT,
  interaction_examples TEXT,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_temperature CHECK (temperature >= 0 AND temperature <= 1)
);

-- Create chatbot access table
CREATE TABLE IF NOT EXISTS chatbot_access (
  user_id CHAR(36),
  chatbot_id CHAR(36),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
  PRIMARY KEY (user_id, chatbot_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chatbots_status ON chatbots(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_access_status ON chatbot_access(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_access_expires_at ON chatbot_access(expires_at);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS before_insert_chatbots_uuid;

-- Add UUID generation trigger
DELIMITER //

CREATE TRIGGER before_insert_chatbots_uuid
BEFORE INSERT ON chatbots
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

DELIMITER ;