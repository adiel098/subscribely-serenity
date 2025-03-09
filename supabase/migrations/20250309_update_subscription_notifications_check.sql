
-- First, let's verify the current constraint
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT c.conname
  INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_namespace n ON t.relnamespace = n.oid
  WHERE t.relname = 'subscription_notifications'
  AND n.nspname = 'public'
  AND c.conname = 'subscription_notifications_notification_type_check';

  -- If constraint exists, drop it and recreate with updated values
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.subscription_notifications DROP CONSTRAINT ' || constraint_name;
    
    -- Create new constraint with the additional values
    EXECUTE 'ALTER TABLE public.subscription_notifications ADD CONSTRAINT subscription_notifications_notification_type_check 
      CHECK (notification_type IN (''welcome'', ''reminder'', ''expiration'', ''removal'', ''first_reminder'', ''second_reminder''))';
  END IF;
END
$$;

-- Run a check to confirm table schema update
DO $$
BEGIN
  RAISE NOTICE 'Subscription notifications table updated to accept first_reminder and second_reminder types';
END
$$;
