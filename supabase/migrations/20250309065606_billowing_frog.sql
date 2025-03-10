/*
  # Create API Tokens Table

  1. New Tables
    - `api_tokens` - API token management
      - `id` (uuid, primary key)
      - `name` (text)
      - `value` (text)
      - `provider` (enum)
      - `created_at` (timestamp)
      - `last_used` (timestamp)
      - `usage_count` (integer)
      - `status` (enum)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
*/

-- Create token status enum
CREATE TYPE token_status AS ENUM ('active', 'inactive', 'revoked');

-- Create API tokens table
CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  provider ai_provider NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  status token_status DEFAULT 'active',
  CONSTRAINT positive_usage_count CHECK (usage_count >= 0)
);

-- Create indexes
CREATE INDEX idx_api_tokens_provider ON api_tokens(provider);
CREATE INDEX idx_api_tokens_status ON api_tokens(status);

-- Add RLS policies
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- Only admins can manage API tokens
CREATE POLICY admin_manage_tokens ON api_tokens
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'admin'
    ));