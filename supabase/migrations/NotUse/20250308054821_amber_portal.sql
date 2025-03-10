/*
  # Create API tokens table

  1. New Tables
    - `api_tokens`
      - `id` (uuid, primary key)
      - `name` (text)
      - `value` (text, encrypted)
      - `provider` (text)
      - `created_at` (timestamptz)
      - `last_used` (timestamptz)
      - `usage_count` (integer)
      - `is_active` (boolean)

  2. Security
    - Enable RLS on `api_tokens` table
    - Add policies for admin users only
*/

CREATE TABLE IF NOT EXISTS api_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  provider text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_used timestamptz,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  CONSTRAINT valid_provider CHECK (provider IN ('openai', 'deepseek', 'other'))
);

ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage API tokens"
  ON api_tokens
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );