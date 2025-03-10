/*
  # Create Chat History Tables

  1. New Tables
    - `chat_sessions` - Chat session management
      - `id` (char(36), primary key)
      - `user_id` (char(36), foreign key)
      - `chatbot_id` (char(36), foreign key)
      - `title` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `status` (enum)
      - `metadata` (json)

    - `chat_messages` - Message history
      - `id` (char(36), primary key)
      - `session_id` (char(36), foreign key)
      - `role` (enum)
      - `content` (text)
      - `timestamp` (timestamp)
      - `metadata` (json)

    - `chat_tags` - Session tagging
      - `session_id` (char(36), foreign key)
      - `tag` (text)

  2. Security
    - Access control should be implemented at the application level
    - Users should only access their own chat sessions
    - Time range validation using CHECK constraint
*/

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  chatbot_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  status ENUM('active', 'completed', 'archived') DEFAULT 'active',
  metadata JSON DEFAULT '{}',
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time >= start_time),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id CHAR(36) PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON DEFAULT '{}',
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create chat tags table
CREATE TABLE IF NOT EXISTS chat_tags (
  session_id CHAR(36),
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (session_id, tag),
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_chatbot_id ON chat_sessions(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_tags_tag ON chat_tags(tag);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS before_insert_chat_sessions_uuid;
DROP TRIGGER IF EXISTS before_insert_chat_messages_uuid;

-- Add UUID generation triggers
DELIMITER //

CREATE TRIGGER before_insert_chat_sessions_uuid
BEFORE INSERT ON chat_sessions
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

CREATE TRIGGER before_insert_chat_messages_uuid
BEFORE INSERT ON chat_messages
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

DELIMITER ;