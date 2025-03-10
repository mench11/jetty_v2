-- Database setup for Jetty v2
-- Run this SQL file in phpMyAdmin to create the necessary tables

-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Drop tables if they exist
DROP TABLE IF EXISTS user_chatbot_access;
DROP TABLE IF EXISTS api_tokens;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS chatbots;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Create users table
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

-- Create chatbots table
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

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  chatbot_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Create api_tokens table
CREATE TABLE api_tokens (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME,
  last_used_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_chatbot_access table for many-to-many relationship
CREATE TABLE user_chatbot_access (
  user_id VARCHAR(255) NOT NULL,
  chatbot_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (user_id, chatbot_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chatbot_id) REFERENCES chatbots(id) ON DELETE CASCADE
);

-- Insert sample data

-- Sample users
INSERT INTO users (id, name, email, user_type, access_expiry, created_at, last_active, password_hash) VALUES
('user-1', '張三', 'zhang@example.com', 'premium', DATE_ADD(NOW(), INTERVAL 60 DAY), '2023-01-01 00:00:00', '2023-06-15 00:00:00', '$2a$10$dummyhashforzhang'),
('user-2', '李四', 'li@example.com', 'free', DATE_ADD(NOW(), INTERVAL 7 DAY), '2023-02-15 00:00:00', '2023-06-10 00:00:00', '$2a$10$dummyhashforli'),
('user-3', '王五', 'wang@example.com', 'admin', NULL, '2023-01-10 00:00:00', '2023-06-20 00:00:00', '$2a$10$dummyhashforwang');

-- Sample chatbots
INSERT INTO chatbots (id, name, model, provider, daily_limit, max_tokens, has_file_access, system_prompt, welcome_message, knowledge_base, knowledge_base_enabled, response_language, temperature, emoji_mode, role, principles, interaction_examples) VALUES
('chatbot-1', '通用助手', 'gpt-4', 'openai', 100, 4000, true, '你是一個有用的助手。', '您好！我是通用助手，有什麼可以幫您的嗎？', NULL, false, 'zh-TW', 0.7, true, '助手', '誠實、有用、安全', '用戶: 你好\n助手: 您好！有什麼可以幫您的嗎？'),
('chatbot-2', '教育顧問', 'gpt-4', 'openai', 50, 8000, true, '你是一個專業的教育顧問。', '您好！我是您的教育顧問，有關於學習或教育的問題都可以問我。', '教育資源和指南', true, 'zh-TW', 0.5, false, '教育顧問', '專業、耐心、鼓勵', '用戶: 如何提高學習效率？\n助手: 提高學習效率有幾個關鍵方法...');

-- Sample chat sessions
INSERT INTO chat_sessions (id, user_id, chatbot_id, title, created_at, updated_at) VALUES
('session-1', 'user-1', 'chatbot-1', '一般問題諮詢', '2023-06-01 10:00:00', '2023-06-01 10:30:00'),
('session-2', 'user-1', 'chatbot-2', '關於學習方法的討論', '2023-06-02 14:00:00', '2023-06-02 14:45:00'),
('session-3', 'user-2', 'chatbot-1', '技術支援', '2023-06-03 09:00:00', '2023-06-03 09:15:00');

-- Sample chat messages
INSERT INTO chat_messages (id, session_id, role, content, created_at) VALUES
('msg-1', 'session-1', 'user', '你好，請問你是誰？', '2023-06-01 10:00:00'),
('msg-2', 'session-1', 'assistant', '您好！我是通用助手，有什麼可以幫您的嗎？', '2023-06-01 10:00:05'),
('msg-3', 'session-1', 'user', '你能做什麼？', '2023-06-01 10:00:30'),
('msg-4', 'session-1', 'assistant', '我可以回答問題、提供資訊、協助解決問題，以及進行一般對話。您有什麼特定的需求嗎？', '2023-06-01 10:00:35'),
('msg-5', 'session-2', 'user', '如何提高學習效率？', '2023-06-02 14:00:00'),
('msg-6', 'session-2', 'assistant', '提高學習效率有幾個關鍵方法：1. 制定明確的學習計劃；2. 使用番茄工作法分配時間；3. 確保充足的休息；4. 創建良好的學習環境；5. 使用主動學習技巧而非被動閱讀。您想了解其中哪一項更詳細的資訊嗎？', '2023-06-02 14:00:10'),
('msg-7', 'session-3', 'user', '我的應用程序無法啟動，怎麼辦？', '2023-06-03 09:00:00'),
('msg-8', 'session-3', 'assistant', '讓我們一起排查問題。首先，請嘗試重新啟動您的設備。如果問題仍然存在，請檢查應用程序是否需要更新。您也可以嘗試卸載並重新安裝該應用程序。能告訴我您使用的是什麼設備和操作系統嗎？', '2023-06-03 09:00:10');

-- Sample API tokens
INSERT INTO api_tokens (id, user_id, token, name, created_at, expires_at, last_used_at) VALUES
('token-1', 'user-3', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample1', '管理員API金鑰', '2023-05-01 00:00:00', '2024-05-01 00:00:00', '2023-06-20 00:00:00'),
('token-2', 'user-1', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample2', '應用程序整合', '2023-05-15 00:00:00', '2023-11-15 00:00:00', '2023-06-15 00:00:00');

-- Sample user-chatbot access
INSERT INTO user_chatbot_access (user_id, chatbot_id) VALUES
('user-1', 'chatbot-1'),
('user-1', 'chatbot-2'),
('user-2', 'chatbot-1'),
('user-3', 'chatbot-1'),
('user-3', 'chatbot-2');
