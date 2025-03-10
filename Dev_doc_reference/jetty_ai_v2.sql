-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 10, 2025 at 11:32 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jetty_ai`
--

-- --------------------------------------------------------

--
-- Table structure for table `api_tokens`
--

CREATE TABLE `api_tokens` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` text NOT NULL,
  `provider` enum('openai','deepseek','other') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_used` timestamp NULL DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `status` enum('active','inactive','revoked') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `api_tokens`
--

INSERT INTO `api_tokens` (`id`, `name`, `value`, `provider`, `created_at`, `last_used`, `usage_count`, `status`) VALUES
('token111-1111-1111-1111-111111111111', 'OpenAI API Key', 'sk-dummy-openai-api-key-for-testing-purposes-only', 'openai', '2023-04-30 23:00:00', '2023-06-19 23:00:00', 42, 'active'),
('token222-2222-2222-2222-222222222222', 'DeepSeek API Key', 'sk-dummy-deepseek-api-key-for-testing-purposes-only', 'deepseek', '2023-05-14 23:00:00', '2023-06-14 23:00:00', 27, 'active');

--
-- Triggers `api_tokens`
--
DELIMITER $$
CREATE TRIGGER `before_insert_api_tokens_uuid` BEFORE INSERT ON `api_tokens` FOR EACH ROW BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `chatbots`
--

CREATE TABLE `chatbots` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `model` varchar(100) NOT NULL,
  `provider` enum('openai','deepseek','other') DEFAULT 'openai',
  `daily_limit` int(11) NOT NULL DEFAULT 50,
  `max_tokens` int(11) NOT NULL DEFAULT 4000,
  `has_file_access` tinyint(1) DEFAULT 0,
  `system_prompt` text DEFAULT NULL,
  `welcome_message` text DEFAULT NULL,
  `knowledge_base` text DEFAULT NULL,
  `response_language` enum('zh-HK','en','zh-CN','zh-TW') DEFAULT 'zh-TW',
  `temperature` decimal(3,2) DEFAULT 0.70,
  `emoji_mode` tinyint(1) DEFAULT 0,
  `role` varchar(100) DEFAULT NULL,
  `principles` text DEFAULT NULL,
  `interaction_examples` text DEFAULT NULL,
  `status` enum('active','inactive','maintenance') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbots`
--

INSERT INTO `chatbots` (`id`, `name`, `model`, `provider`, `daily_limit`, `max_tokens`, `has_file_access`, `system_prompt`, `welcome_message`, `knowledge_base`, `response_language`, `temperature`, `emoji_mode`, `role`, `principles`, `interaction_examples`, `status`, `created_at`, `updated_at`) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '通用助手', 'gpt-4', 'openai', 100, 4000, 1, '你是一個有用的助手。', '您好！我是通用助手，有什麼可以幫您的嗎？', NULL, 'zh-TW', 0.70, 1, '助手', '誠實、有用、安全', '用戶: 你好\n助手: 您好！有什麼可以幫您的嗎？', 'active', '2025-03-10 10:22:21', '2025-03-10 10:22:21'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '教育顧問', 'gpt-4', 'openai', 50, 8000, 1, '你是一個專業的教育顧問。', '您好！我是您的教育顧問，有關於學習或教育的問題都可以問我。', '教育資源和指南', 'zh-TW', 0.50, 0, '教育顧問', '專業、耐心、鼓勵', '用戶: 如何提高學習效率？\n助手: 提高學習效率有幾個關鍵方法...', 'active', '2025-03-10 10:22:21', '2025-03-10 10:22:21');

--
-- Triggers `chatbots`
--
DELIMITER $$
CREATE TRIGGER `before_insert_chatbots_uuid` BEFORE INSERT ON `chatbots` FOR EACH ROW BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `chatbot_access`
--

CREATE TABLE `chatbot_access` (
  `user_id` char(36) NOT NULL,
  `chatbot_id` char(36) NOT NULL,
  `granted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','expired','revoked') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chatbot_access`
--

INSERT INTO `chatbot_access` (`user_id`, `chatbot_id`, `granted_at`, `expires_at`, `status`) VALUES
('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023-01-01 00:00:00', '2025-05-09 09:22:21', 'active'),
('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2023-01-01 00:00:00', '2025-05-09 09:22:21', 'active'),
('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023-02-15 00:00:00', '2025-03-17 10:22:21', 'active'),
('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2023-01-10 00:00:00', NULL, 'active'),
('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2023-01-10 00:00:00', NULL, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` char(36) NOT NULL,
  `session_id` char(36) NOT NULL,
  `role` enum('user','assistant','system') NOT NULL,
  `content` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `session_id`, `role`, `content`, `timestamp`, `metadata`) VALUES
('msg11111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'user', '你好，請問你是誰？', '2023-06-01 09:00:00', '{}'),
('msg22222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'assistant', '您好！我是通用助手，有什麼可以幫您的嗎？', '2023-06-01 09:00:05', '{}'),
('msg33333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'user', '你能做什麼？', '2023-06-01 09:00:30', '{}'),
('msg44444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'assistant', '我可以回答問題、提供資訊、協助解決問題，以及進行一般對話。您有什麼特定的需求嗎？', '2023-06-01 09:00:35', '{}'),
('msg55555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'user', '如何提高學習效率？', '2023-06-02 13:00:00', '{}'),
('msg66666-6666-6666-6666-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'assistant', '提高學習效率有幾個關鍵方法：1. 制定明確的學習計劃；2. 使用番茄工作法分配時間；3. 確保充足的休息；4. 創建良好的學習環境；5. 使用主動學習技巧而非被動閱讀。您想了解其中哪一項更詳細的資訊嗎？', '2023-06-02 13:00:10', '{}');

--
-- Triggers `chat_messages`
--
DELIMITER $$
CREATE TRIGGER `before_insert_chat_messages_uuid` BEFORE INSERT ON `chat_messages` FOR EACH ROW BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `chat_sessions`
--

CREATE TABLE `chat_sessions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `chatbot_id` char(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `status` enum('active','completed','archived') DEFAULT 'active',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_sessions`
--

INSERT INTO `chat_sessions` (`id`, `user_id`, `chatbot_id`, `title`, `start_time`, `end_time`, `status`, `metadata`) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '一般問題諮詢', '2023-06-01 09:00:00', NULL, 'active', '{}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '關於學習方法的討論', '2023-06-02 13:00:00', NULL, 'active', '{}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '技術支援', '2023-06-03 08:00:00', NULL, 'active', '{}');

--
-- Triggers `chat_sessions`
--
DELIMITER $$
CREATE TRIGGER `before_insert_chat_sessions_uuid` BEFORE INSERT ON `chat_sessions` FOR EACH ROW BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `chat_tags`
--

CREATE TABLE `chat_tags` (
  `session_id` char(36) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `page_permissions`
--

CREATE TABLE `page_permissions` (
  `user_type_id` char(36) NOT NULL,
  `page_path` varchar(255) NOT NULL,
  `can_access` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_type` enum('free','premium','admin') NOT NULL DEFAULT 'free',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active'
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `name`, `password_hash`, `user_type`, `created_at`, `updated_at`, `last_login`, `status`) VALUES
('11111111-1111-1111-1111-111111111111', 'zhang@example.com', '張三', '$2a$10$dummyhashforzhang', 'premium', '2023-01-01 00:00:00', '2025-03-10 10:22:21', '2023-06-14 23:00:00', 'active'),
('22222222-2222-2222-2222-222222222222', 'li@example.com', '李四', '$2a$10$dummyhashforli', 'free', '2023-02-15 00:00:00', '2025-03-10 10:22:21', '2023-06-09 23:00:00', 'active'),
('33333333-3333-3333-3333-333333333333', 'wang@example.com', '王五', '$2a$10$dummyhashforwang', 'admin', '2023-01-10 00:00:00', '2025-03-10 10:22:21', '2023-06-19 23:00:00', 'active');

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `before_insert_users_uuid` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `user_id` char(36) NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
  `learning_style` enum('visual','auditory','reading','kinesthetic') DEFAULT 'visual',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_tokens`
--
ALTER TABLE `api_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_api_tokens_provider_type` (`provider`),
  ADD KEY `idx_api_tokens_status_type` (`status`);

--
-- Indexes for table `chatbots`
--
ALTER TABLE `chatbots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chatbots_status` (`status`);

--
-- Indexes for table `chatbot_access`
--
ALTER TABLE `chatbot_access`
  ADD PRIMARY KEY (`user_id`,`chatbot_id`),
  ADD KEY `chatbot_id` (`chatbot_id`),
  ADD KEY `idx_chatbot_access_status` (`status`),
  ADD KEY `idx_chatbot_access_expires_at` (`expires_at`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_messages_session_id` (`session_id`),
  ADD KEY `idx_chat_messages_timestamp` (`timestamp`);

--
-- Indexes for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_sessions_user_id` (`user_id`),
  ADD KEY `idx_chat_sessions_chatbot_id` (`chatbot_id`),
  ADD KEY `idx_chat_sessions_status` (`status`);

--
-- Indexes for table `chat_tags`
--
ALTER TABLE `chat_tags`
  ADD PRIMARY KEY (`session_id`,`tag`),
  ADD KEY `idx_chat_tags_tag` (`tag`);

--
-- Indexes for table `page_permissions`
--
ALTER TABLE `page_permissions`
  ADD PRIMARY KEY (`user_type_id`,`page_path`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_user_type` (`user_type`),
  ADD KEY `idx_users_status` (`status`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`user_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `chatbot_access`
--
ALTER TABLE `chatbot_access`
  ADD CONSTRAINT `chatbot_access_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chatbot_access_ibfk_2` FOREIGN KEY (`chatbot_id`) REFERENCES `chatbots` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_sessions`
--
ALTER TABLE `chat_sessions`
  ADD CONSTRAINT `chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_sessions_ibfk_2` FOREIGN KEY (`chatbot_id`) REFERENCES `chatbots` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_tags`
--
ALTER TABLE `chat_tags`
  ADD CONSTRAINT `chat_tags_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `chat_sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
