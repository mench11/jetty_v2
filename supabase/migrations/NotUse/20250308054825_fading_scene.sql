/*
  # Create user types table

  1. New Tables
    - `user_types`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `status` (boolean)
      - `accessible_pages` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_types` table
    - Add policies for admin users only
*/

CREATE TABLE IF NOT EXISTS user_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status boolean DEFAULT true,
  accessible_pages text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage user types"
  ON user_types
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );