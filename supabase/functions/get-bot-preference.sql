
-- Function to get user's bot preference
CREATE OR REPLACE FUNCTION public.get_bot_preference()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get the bot settings for any community owned by this user
  -- We use the first community we find since the preference should be the same across all communities
  SELECT 
    json_build_object(
      'use_custom', COALESCE(tbs.use_custom_bot, false),
      'custom_bot_token', tbs.custom_bot_token
    ) INTO v_result
  FROM 
    public.telegram_bot_settings tbs
  JOIN 
    public.communities c ON tbs.community_id = c.id
  WHERE 
    c.owner_id = v_user_id
  LIMIT 1;
  
  -- If no communities with bot settings exist yet, return default values
  IF v_result IS NULL THEN
    v_result := json_build_object(
      'use_custom', false,
      'custom_bot_token', NULL
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to use the function
GRANT EXECUTE ON FUNCTION public.get_bot_preference() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_bot_preference() TO service_role;
