-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2025 at 07:52 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
) ;

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
) ;

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
) ;

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

-- --------------------------------------------------------

--
-- Table structure for table `user_types`
--

CREATE TABLE `user_types` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `user_types`
--
DELIMITER $$
CREATE TRIGGER `before_insert_user_types_uuid` BEFORE INSERT ON `user_types` FOR EACH ROW BEGIN
    IF NEW.id IS NULL THEN
        SET NEW.id = UUID();
    END IF;
END
$$
DELIMITER ;

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
  ADD PRIMARY KEY (`user_type_id`,`page_path`),
  ADD KEY `idx_page_permissions_access` (`can_access`);

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
-- Indexes for table `user_types`
--
ALTER TABLE `user_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_user_types_name` (`name`);

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
-- Constraints for table `page_permissions`
--
ALTER TABLE `page_permissions`
  ADD CONSTRAINT `page_permissions_ibfk_1` FOREIGN KEY (`user_type_id`) REFERENCES `user_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
