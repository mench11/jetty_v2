/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `preferences` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_login` (timestamptz)
      - `user_type` (text)
      - `access_expiry` (timestamptz)

  2. Security
    - Enable RLS on `users` table
    - Add policies for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  preferences jsonb DEFAULT '{"subject": "", "level": "beginner", "learningStyle": "visual"}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  user_type text DEFAULT 'free',
  access_expiry timestamptz,
  CONSTRAINT valid_user_type CHECK (user_type IN ('free', 'premium', 'admin'))
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);