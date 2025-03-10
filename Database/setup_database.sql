-- Database setup for Jetty v2 based on existing schema
-- Run this SQL file in phpMyAdmin to create the necessary tables

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Drop tables if they exist
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS chat_tags;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS chatbot_access;
DROP TABLE IF EXISTS page_permissions;
DROP TABLE IF EXISTS api_tokens;
DROP TABLE IF EXISTS chatbots;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_types;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

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

-- Create chatbots table
CREATE TABLE IF NOT EXISTS chatbots (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100) NOT NULL,
  provider ENUM('openai', 'deepseek', 'other') DEFAULT 'openai',
  daily_limit INT NOT NULL DEFAULT 50,
  max_tokens INT NOT NULL DEFAULT 4000,
  has_file_access TINYINT(1) DEFAULT 0,
  system_prompt TEXT DEFAULT NULL,
  welcome_message TEXT DEFAULT NULL,
  knowledge_base TEXT DEFAULT NULL,
  response_language ENUM('zh-HK', 'en', 'zh-CN', 'zh-TW') DEFAULT 'zh-TW',
  temperature DECIMAL(3,2) DEFAULT 0.70,
  emoji_mode TINYINT(1) DEFAULT 0,
  role VARCHAR(100) DEFAULT NULL,
  principles TEXT DEFAULT NULL,
  interaction_examples TEXT DEFAULT NULL,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  chatbot_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL DEFAULT NULL,
  status ENUM('active', 'completed', 'archived') DEFAULT 'active',
  metadata JSON DEFAULT '{}',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id CHAR(36) PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  role ENUM('user', 'assistant', 'system') NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON DEFAULT '{}',
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create api_tokens table
CREATE TABLE IF NOT EXISTS api_tokens (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  provider ENUM('openai', 'deepseek', 'other') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP NULL DEFAULT NULL,
  usage_count INT DEFAULT 0,
  status ENUM('active', 'inactive', 'revoked') DEFAULT 'active'
);

-- Create chatbot_access table
CREATE TABLE IF NOT EXISTS chatbot_access (
  user_id CHAR(36) NOT NULL,
  chatbot_id CHAR(36) NOT NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
  PRIMARY KEY (user_id, chatbot_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
);

-- Create chat_tags table
CREATE TABLE IF NOT EXISTS chat_tags (
  session_id CHAR(36) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (session_id, tag),
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create page_permissions table
CREATE TABLE IF NOT EXISTS page_permissions (
  user_type_id CHAR(36) NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  can_access TINYINT(1) DEFAULT 0,
  PRIMARY KEY (user_type_id, page_path)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_chatbots_status ON chatbots(status);

CREATE INDEX IF NOT EXISTS idx_chatbot_access_status ON chatbot_access(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_access_expires_at ON chatbot_access(expires_at);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_chatbot_id ON chat_sessions(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_chat_tags_tag ON chat_tags(tag);

CREATE INDEX IF NOT EXISTS idx_api_tokens_provider_type ON api_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_api_tokens_status_type ON api_tokens(status);

-- Add UUID generation triggers
DELIMITER //

-- Users trigger
CREATE TRIGGER before_insert_users_uuid
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

-- Chatbots trigger
CREATE TRIGGER before_insert_chatbots_uuid
BEFORE INSERT ON chatbots
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

-- Chat sessions trigger
CREATE TRIGGER before_insert_chat_sessions_uuid
BEFORE INSERT ON chat_sessions
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

-- Chat messages trigger
CREATE TRIGGER before_insert_chat_messages_uuid
BEFORE INSERT ON chat_messages
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

-- API tokens trigger
CREATE TRIGGER before_insert_api_tokens_uuid
BEFORE INSERT ON api_tokens
FOR EACH ROW
BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END //

DELIMITER ;

-- Insert sample data

-- Sample users
INSERT INTO users (id, email, name, password_hash, user_type, created_at, last_login, status) VALUES
('11111111-1111-1111-1111-111111111111', 'zhang@example.com', '張三', '$2a$10$dummyhashforzhang', 'premium', '2023-01-01 00:00:00', '2023-06-15 00:00:00', 'active'),
('22222222-2222-2222-2222-222222222222', 'li@example.com', '李四', '$2a$10$dummyhashforli', 'free', '2023-02-15 00:00:00', '2023-06-10 00:00:00', 'active'),
('33333333-3333-3333-3333-333333333333', 'wang@example.com', '王五', '$2a$10$dummyhashforwang', 'admin', '2023-01-10 00:00:00', '2023-06-20 00:00:00', 'active');

-- Sample chatbots
INSERT INTO chatbots (id, name, model, provider, daily_limit, max_tokens, has_file_access, system_prompt, welcome_message, knowledge_base, response_language, temperature, emoji_mode, role, principles, interaction_examples, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '通用助手', 'gpt-4', 'openai', 100, 4000, 1, '你是一個有用的助手。', '您好！我是通用助手，有什麼可以幫您的嗎？', NULL, 'zh-TW', 0.7, 1, '助手', '誠實、有用、安全', '用戶: 你好\n助手: 您好！有什麼可以幫您的嗎？', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '教育顧問', 'gpt-4', 'openai', 50, 8000, 1, '你是一個專業的教育顧問。', '您好！我是您的教育顧問，有關於學習或教育的問題都可以問我。', '教育資源和指南', 'zh-TW', 0.5, 0, '教育顧問', '專業、耐心、鼓勵', '用戶: 如何提高學習效率？\n助手: 提高學習效率有幾個關鍵方法...', 'active');

-- Sample chat sessions
INSERT INTO chat_sessions (id, user_id, chatbot_id, title, start_time, end_time, status) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '一般問題諮詢', '2023-06-01 10:00:00', NULL, 'active'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '關於學習方法的討論', '2023-06-02 14:00:00', NULL, 'active'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '技術支援', '2023-06-03 09:00:00', NULL, 'active');

-- Sample chat messages
INSERT INTO chat_messages (id, session_id, role, content, timestamp) VALUES
('msg11111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'user', '你好，請問你是誰？', '2023-06-01 10:00:00'),
('msg22222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'assistant', '您好！我是通用助手，有什麼可以幫您的嗎？', '2023-06-01 10:00:05'),
('msg33333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'user', '你能做什麼？', '2023-06-01 10:00:30'),
('msg44444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'assistant', '我可以回答問題、提供資訊、協助解決問題，以及進行一般對話。您有什麼特定的需求嗎？', '2023-06-01 10:00:35'),
('msg55555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'user', '如何提高學習效率？', '2023-06-02 14:00:00'),
('msg66666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'assistant', '提高學習效率有幾個關鍵方法：1. 制定明確的學習計劃；2. 使用番茄工作法分配時間；3. 確保充足的休息；4. 創建良好的學習環境；5. 使用主動學習技巧而非被動閱讀。您想了解其中哪一項更詳細的資訊嗎？', '2023-06-02 14:00:10');

-- Sample chatbot access
INSERT INTO chatbot_access (user_id, chatbot_id, granted_at, expires_at, status) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023-01-01 00:00:00', DATE_ADD(NOW(), INTERVAL 60 DAY), 'active'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2023-01-01 00:00:00', DATE_ADD(NOW(), INTERVAL 60 DAY), 'active'),
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023-02-15 00:00:00', DATE_ADD(NOW(), INTERVAL 7 DAY), 'active'),
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023-01-10 00:00:00', NULL, 'active'),
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2023-01-10 00:00:00', NULL, 'active');

-- Sample API tokens
INSERT INTO api_tokens (id, name, value, provider, created_at, last_used, usage_count, status) VALUES
('token111-1111-1111-1111-111111111111', 'OpenAI API Key', 'sk-dummy-openai-api-key-for-testing-purposes-only', 'openai', '2023-05-01 00:00:00', '2023-06-20 00:00:00', 42, 'active'),
('token222-2222-2222-2222-222222222222', 'DeepSeek API Key', 'sk-dummy-deepseek-api-key-for-testing-purposes-only', 'deepseek', '2023-05-15 00:00:00', '2023-06-15 00:00:00', 27, 'active');
