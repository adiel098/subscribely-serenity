
-- First, make sure the required extensions are enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Drop existing schedule if it exists
select cron.unschedule('check-expired-subscriptions');

-- Create new schedule with direct function invocation
select cron.schedule(
  'check-expired-subscriptions',
  '* * * * *', -- Run every minute
  $$
  select
    net.http_post(
      url:='https://trkiniaqliiwdkrvvuky.supabase.co/functions/v1/check-subscriptions',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2luaWFxbGlpd2RrcnZ2dWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MDUzMTMsImV4cCI6MjA1NTI4MTMxM30.3BYeVu2QCUT7LozpFWCgcP9zSfLA7v3FzO_6n6nZzM0"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Create a function to check the schedule status
CREATE OR REPLACE FUNCTION public.check_cron_job_status(job_name text)
RETURNS TABLE(
    jobid integer,
    schedule text,
    last_run timestamp with time zone,
    next_run timestamp with time zone,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.jobid,
        j.schedule,
        j.last_run,
        j.next_run,
        CASE 
            WHEN j.active THEN 'active'
            ELSE 'inactive'
        END as status
    FROM cron.job j
    WHERE j.jobname = job_name;
END;
$$ LANGUAGE plpgsql;
