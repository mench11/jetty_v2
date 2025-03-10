/*
  # Create chat history tables

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `chatbot_id` (uuid, references chatbots)
      - `title` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references chat_sessions)
      - `role` (text)
      - `content` (text)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to read/write their own chat history
*/

CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  chatbot_id uuid REFERENCES chatbots(id) ON DELETE CASCADE,
  title text NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read messages from own sessions"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own sessions"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );