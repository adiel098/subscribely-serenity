
-- Function to get user's bot preference
CREATE OR REPLACE FUNCTION public.get_bot_preference()
RETURNS json AS $$
DECLARE
  v_user_id UUID;
  v_preference JSONB;
  v_custom_bot_settings RECORD;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Try to get the preference from user_preferences first
  SELECT preference_value INTO v_preference
  FROM public.user_preferences
  WHERE user_id = v_user_id AND preference_name = 'telegram_bot_preference';
  
  -- If no preference found, check if user has any projects with bot settings
  IF v_preference IS NULL THEN
    SELECT 
      tbs.use_custom_bot, 
      tbs.custom_bot_token
    INTO v_custom_bot_settings
    FROM public.telegram_bot_settings tbs
    JOIN public.projects p ON tbs.project_id = p.id
    WHERE p.owner_id = v_user_id
    ORDER BY p.created_at DESC
    LIMIT 1;
    
    IF v_custom_bot_settings IS NOT NULL THEN
      v_preference := jsonb_build_object(
        'use_custom', v_custom_bot_settings.use_custom_bot,
        'custom_bot_token', v_custom_bot_settings.custom_bot_token
      );
    ELSE
      -- Check if there's a project with a bot token
      SELECT 
        bot_token
      INTO v_custom_bot_settings
      FROM public.projects
      WHERE owner_id = v_user_id AND bot_token IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1;
      
      IF v_custom_bot_settings IS NOT NULL THEN
        v_preference := jsonb_build_object(
          'use_custom', TRUE,
          'custom_bot_token', v_custom_bot_settings.bot_token
        );
      ELSE
        -- Default to official bot if no settings found
        v_preference := jsonb_build_object(
          'use_custom', false,
          'custom_bot_token', NULL
        );
      END IF;
    END IF;
  END IF;
  
  RETURN v_preference;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
