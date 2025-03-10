/*
  # Create chatbots table

  1. New Tables
    - `chatbots`
      - `id` (uuid, primary key)
      - `name` (text)
      - `model` (text)
      - `provider` (text)
      - `daily_limit` (integer)
      - `max_tokens` (integer)
      - `has_file_access` (boolean)
      - `system_prompt` (text)
      - `welcome_message` (text)
      - `knowledge_base` (text)
      - `response_language` (text)
      - `temperature` (numeric)
      - `emoji_mode` (boolean)
      - `role` (text)
      - `principles` (text)
      - `interaction_examples` (text)
      - `knowledge_base_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `chatbots` table
    - Add policies for authenticated users to read accessible chatbots
*/

CREATE TABLE IF NOT EXISTS chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model text NOT NULL,
  provider text DEFAULT 'openai',
  daily_limit integer DEFAULT 50,
  max_tokens integer DEFAULT 4000,
  has_file_access boolean DEFAULT false,
  system_prompt text,
  welcome_message text,
  knowledge_base text,
  response_language text DEFAULT 'zh-TW',
  temperature numeric DEFAULT 0.7,
  emoji_mode boolean DEFAULT false,
  role text,
  principles text,
  interaction_examples text,
  knowledge_base_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_provider CHECK (provider IN ('openai', 'deepseek', 'other')),
  CONSTRAINT valid_response_language CHECK (response_language IN ('zh-HK', 'en', 'zh-CN', 'zh-TW'))
);

ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chatbots"
  ON chatbots
  FOR SELECT
  TO authenticated
  USING (true);