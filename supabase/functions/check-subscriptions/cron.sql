

-- First, make sure the required extensions are enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Create an updated version of the get_members_to_check function that uses string comparison
CREATE OR REPLACE FUNCTION public.get_members_to_check_v2()
RETURNS TABLE(
    member_id uuid, 
    community_id uuid, 
    telegram_user_id text, 
    subscription_end_date timestamp with time zone, 
    is_active boolean, 
    subscription_status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as member_id,
        m.community_id,
        m.telegram_user_id,
        m.subscription_end_date,
        m.is_active,
        m.subscription_status
    FROM telegram_chat_members m
    WHERE 
        (
            -- Check expired subscriptions
            (m.subscription_end_date IS NOT NULL
            AND m.subscription_end_date < (NOW() + INTERVAL '3 days')
            AND m.subscription_status = 'active')
        OR
            -- Include inactive members that might still be in the group
            (m.is_active = false)
        );
END;
$$ LANGUAGE plpgsql;

-- Drop existing schedule if it exists
select cron.unschedule('check-expired-subscriptions');

-- Create new schedule
select cron.schedule(
  'check-expired-subscriptions',
  '* * * * *', -- every minute
  $$
  select
    net.http_post(
      url:='https://trkiniaqliiwdkrvvuky.supabase.co/functions/v1/check-subscriptions',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2luaWFxbGlpd2RrcnZ2dWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MDUzMTMsImV4cCI6MjA1NTI4MTMxM30.3BYeVu2QCUT7LozpFWCgcP9zSfLA7v3FzO_6n6nZzM0"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
