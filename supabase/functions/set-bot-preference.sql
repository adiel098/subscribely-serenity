
-- Function to set user's bot preference
CREATE OR REPLACE FUNCTION public.set_bot_preference(use_custom boolean, custom_token text DEFAULT NULL)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_communities_count INTEGER;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check how many communities the user owns
  SELECT COUNT(*) INTO v_communities_count
  FROM public.communities
  WHERE owner_id = v_user_id;
  
  -- If the user has communities, update their bot settings
  IF v_communities_count > 0 THEN
    -- Update all bot settings for communities owned by this user
    UPDATE public.telegram_bot_settings tbs
    SET 
      use_custom_bot = use_custom,
      custom_bot_token = CASE WHEN use_custom THEN custom_token ELSE NULL END
    FROM public.communities c
    WHERE tbs.community_id = c.id AND c.owner_id = v_user_id;
    
    -- If no bot settings exist yet, insert them for each community
    INSERT INTO public.telegram_bot_settings (community_id, use_custom_bot, custom_bot_token)
    SELECT 
      c.id, 
      use_custom, 
      CASE WHEN use_custom THEN custom_token ELSE NULL END
    FROM public.communities c
    LEFT JOIN public.telegram_bot_settings tbs ON c.id = tbs.community_id
    WHERE c.owner_id = v_user_id AND tbs.community_id IS NULL;
  END IF;
  
  -- Also store the preference in a global setting for future communities
  INSERT INTO public.user_preferences (user_id, preference_name, preference_value)
  VALUES (
    v_user_id, 
    'telegram_bot_preference', 
    jsonb_build_object('use_custom_bot', use_custom, 'custom_bot_token', custom_token)
  )
  ON CONFLICT (user_id, preference_name)
  DO UPDATE SET 
    preference_value = jsonb_build_object('use_custom_bot', use_custom, 'custom_bot_token', custom_token),
    updated_at = now();
    
  -- Log the change
  INSERT INTO public.system_logs (
    event_type,
    details,
    metadata
  ) VALUES (
    'BOT_PREFERENCE_UPDATED',
    'User updated bot preference',
    jsonb_build_object(
      'user_id', v_user_id,
      'use_custom_bot', use_custom,
      'has_token', custom_token IS NOT NULL
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to use the function
GRANT EXECUTE ON FUNCTION public.set_bot_preference(boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_bot_preference(boolean, text) TO service_role;

