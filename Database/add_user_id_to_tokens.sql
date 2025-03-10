-- Add user_id column to api_tokens table
ALTER TABLE api_tokens 
ADD COLUMN user_id CHAR(36) NULL AFTER id,
ADD CONSTRAINT fk_api_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_api_tokens_user_id ON api_tokens(user_id);

-- Update existing tokens to associate with admin user (replace with actual admin user ID)
-- You can change this ID to match your admin user's ID
UPDATE api_tokens SET user_id = '33333333-3333-3333-3333-333333333333' WHERE user_id IS NULL;

-- Add a view to show token information with user details
CREATE OR REPLACE VIEW vw_api_tokens_with_users AS
SELECT 
    t.id,
    t.user_id,
    u.name AS user_name,
    u.email AS user_email,
    t.name,
    t.value,
    t.provider,
    t.created_at,
    t.last_used,
    t.usage_count,
    t.status
FROM api_tokens t
LEFT JOIN users u ON t.user_id = u.id;
