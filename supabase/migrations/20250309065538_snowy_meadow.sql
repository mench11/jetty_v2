/*
  # Create Chatbots Configuration Tables

  1. New Tables
    - `chatbots` - Chatbot configurations
      - `id` (uuid, primary key)
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
      - `temperature` (numeric)
      - `emoji_mode` (boolean)
      - `role` (text)
      - `principles` (text)
      - `interaction_examples` (text)
      - `status` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chatbot_access` - User access to chatbots
      - `user_id` (uuid, foreign key)
      - `chatbot_id` (uuid, foreign key)
      - `granted_at` (timestamp)
      - `expires_at` (timestamp)
      - `status` (enum)

  2. Security
    - Enable RLS on all tables
    - Add policies for access control
*/

-- Create provider enum
CREATE TYPE ai_provider AS ENUM ('openai', 'deepseek', 'other');

-- Create response language enum
CREATE TYPE response_language AS ENUM ('zh-HK', 'en', 'zh-CN', 'zh-TW');

-- Create chatbot status enum
CREATE TYPE chatbot_status AS ENUM ('active', 'inactive', 'maintenance');

-- Create access status enum
CREATE TYPE access_status AS ENUM ('active', 'expired', 'revoked');

-- Create chatbots table
CREATE TABLE IF NOT EXISTS chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100) NOT NULL,
  provider ai_provider DEFAULT 'openai',
  daily_limit INTEGER NOT NULL DEFAULT 50,
  max_tokens INTEGER NOT NULL DEFAULT 4000,
  has_file_access BOOLEAN DEFAULT false,
  system_prompt TEXT,
  welcome_message TEXT,
  knowledge_base TEXT,
  response_language response_language DEFAULT 'zh-TW',
  temperature NUMERIC(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 1),
  emoji_mode BOOLEAN DEFAULT false,
  role VARCHAR(100),
  principles TEXT,
  interaction_examples TEXT,
  status chatbot_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chatbot access table
CREATE TABLE IF NOT EXISTS chatbot_access (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  status access_status DEFAULT 'active',
  PRIMARY KEY (user_id, chatbot_id)
);

-- Create indexes
CREATE INDEX idx_chatbots_status ON chatbots(status);
CREATE INDEX idx_chatbot_access_status ON chatbot_access(status);
CREATE INDEX idx_chatbot_access_expires_at ON chatbot_access(expires_at);

-- Add updated_at trigger to chatbots
CREATE TRIGGER update_chatbots_updated_at
    BEFORE UPDATE ON chatbots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_access ENABLE ROW LEVEL SECURITY;

-- Users can read chatbots they have access to
CREATE POLICY chatbots_read_access ON chatbots
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM chatbot_access
        WHERE chatbot_id = chatbots.id
        AND user_id = auth.uid()
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    ));

-- Admin policies for chatbots
CREATE POLICY admin_manage_chatbots ON chatbots
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'admin'
    ));

-- Users can read their own access records
CREATE POLICY access_read_own ON chatbot_access
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Admin policies for access management
CREATE POLICY admin_manage_access ON chatbot_access
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'admin'
    ));