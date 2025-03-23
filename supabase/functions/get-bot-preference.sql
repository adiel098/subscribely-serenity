
-- Function to get user's bot preference
CREATE OR REPLACE FUNCTION public.get_bot_preference()
RETURNS TABLE (
  use_custom_bot BOOLEAN,
  custom_bot_token TEXT
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Return the bot preference from the first community owned by this user
  -- or default settings if no communities exist yet
  RETURN QUERY
  WITH user_communities AS (
    SELECT c.id
    FROM communities c
    WHERE c.owner_id = v_user_id
    LIMIT 1
  )
  SELECT 
    COALESCE(tbs.use_custom_bot, false) as use_custom_bot,
    tbs.custom_bot_token
  FROM 
    user_communities uc
    LEFT JOIN telegram_bot_settings tbs ON tbs.community_id = uc.id
  LIMIT 1;
  
  -- If no result was returned (user has no communities), return default
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to use the function
GRANT EXECUTE ON FUNCTION public.get_bot_preference() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_bot_preference() TO service_role;
