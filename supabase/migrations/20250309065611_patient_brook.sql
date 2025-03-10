/*
  # Create User Types and Permissions Tables

  1. New Tables
    - `user_types` - User type definitions
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `status` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_type_permissions` - Page access permissions
      - `user_type_id` (uuid, foreign key)
      - `page_path` (text)
      - `granted_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create user types table
CREATE TABLE IF NOT EXISTS user_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  status BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user type permissions table
CREATE TABLE IF NOT EXISTS user_type_permissions (
  user_type_id UUID REFERENCES user_types(id) ON DELETE CASCADE,
  page_path VARCHAR(255) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_type_id, page_path)
);

-- Create indexes
CREATE INDEX idx_user_types_status ON user_types(status);
CREATE INDEX idx_user_type_permissions_page ON user_type_permissions(page_path);

-- Add updated_at trigger to user types
CREATE TRIGGER update_user_types_updated_at
    BEFORE UPDATE ON user_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE user_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_type_permissions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read user types
CREATE POLICY user_types_read ON user_types
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can manage user types
CREATE POLICY admin_manage_user_types ON user_types
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'admin'
    ));

-- All authenticated users can read permissions
CREATE POLICY permissions_read ON user_type_permissions
    FOR SELECT
    TO authenticated
    USING (true);

-- Only admins can manage permissions
CREATE POLICY admin_manage_permissions ON user_type_permissions
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND user_type = 'admin'
    ));