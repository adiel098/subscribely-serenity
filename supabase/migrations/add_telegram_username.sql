
-- Add telegram_username column to subscription_payments if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'project_payments' 
        AND column_name = 'telegram_username'
    ) THEN
        ALTER TABLE project_payments ADD COLUMN telegram_username text;
    END IF;
END
$$;

-- Ensure telegram_username is properly stored in telegram_chat_members
-- (This column should already exist, but we're making sure it's used correctly)
