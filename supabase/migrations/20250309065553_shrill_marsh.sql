/*
  # Create Chat History Tables

  1. New Tables
    - `chat_sessions` - Chat session metadata
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `chatbot_id` (uuid, foreign key)
      - `title` (text)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `status` (enum)
      - `metadata` (jsonb)

    - `chat_messages` - Individual chat messages
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `role` (enum)
      - `content` (text)
      - `timestamp` (timestamp)
      - `metadata` (jsonb)

    - `chat_tags` - Tags for chat sessions
      - `session_id` (uuid, foreign key)
      - `tag` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for data access
*/

-- Create chat status enum
CREATE TYPE chat_status AS ENUM ('active', 'completed', 'archived');

-- Create message role enum
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP WITH TIME ZONE,
  status chat_status DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time >= start_time)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create chat tags table
CREATE TABLE IF NOT EXISTS chat_tags (
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  PRIMARY KEY (session_id, tag)
);

-- Create indexes
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_chatbot_id ON chat_sessions(chatbot_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_chat_tags_tag ON chat_tags(tag);

-- Add RLS policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_tags ENABLE ROW LEVEL SECURITY;

-- Users can read their own chat sessions
CREATE POLICY sessions_read_own ON chat_sessions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can create their own chat sessions
CREATE POLICY sessions_create_own ON chat_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Users can update their own chat sessions
CREATE POLICY sessions_update_own ON chat_sessions
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Users can read messages from their sessions
CREATE POLICY messages_read_own ON chat_messages
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE id = chat_messages.session_id
        AND user_id = auth.uid()
    ));

-- Users can create messages in their sessions
CREATE POLICY messages_create_own ON chat_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE id = chat_messages.session_id
        AND user_id = auth.uid()
    ));

-- Users can read tags from their sessions
CREATE POLICY tags_read_own ON chat_tags
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE id = chat_tags.session_id
        AND user_id = auth.uid()
    ));

-- Users can manage tags on their sessions
CREATE POLICY tags_manage_own ON chat_tags
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE id = chat_tags.session_id
        AND user_id = auth.uid()
    ));