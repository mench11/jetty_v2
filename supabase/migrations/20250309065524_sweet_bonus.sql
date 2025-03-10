/*
  # Create Users and Authentication Tables

  1. New Tables
    - `users` - Core user information
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `password_hash` (text)
      - `user_type` (enum)
      - `preferences` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)
      - `status` (enum)
    
    - `user_preferences` - User settings and preferences
      - `user_id` (uuid, foreign key)
      - `subject` (text)
      - `level` (enum)
      - `learning_style` (enum)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create user status enum
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Create user type enum
CREATE TYPE user_type AS ENUM ('free', 'premium', 'admin');

-- Create learning level enum
CREATE TYPE learning_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create learning style enum
CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'reading', 'kinesthetic');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type user_type NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  status user_status DEFAULT 'active',
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(100),
  level learning_level DEFAULT 'beginner',
  learning_style learning_style DEFAULT 'visual',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_read_own ON users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY users_update_own ON users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Users can read their own preferences
CREATE POLICY preferences_read_own ON user_preferences
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY preferences_update_own ON user_preferences
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY admin_manage_users ON users
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'admin'
    ));

CREATE POLICY admin_manage_preferences ON user_preferences
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'admin'
    ));