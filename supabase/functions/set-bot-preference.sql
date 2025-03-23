
-- Function to set user's bot preference
CREATE OR REPLACE FUNCTION public.set_bot_preference(use_custom BOOLEAN)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- If the user doesn't have any communities yet, we'll create a default setting
  -- that will be used for all future communities
  INSERT INTO public.telegram_bot_settings 
    (id, use_custom_bot, created_at, updated_at) 
  VALUES 
    (gen_random_uuid(), use_custom, now(), now())
  ON CONFLICT DO NOTHING;
  
  -- Update all existing communities owned by this user to use the selected bot type
  UPDATE public.telegram_bot_settings tbs
  SET 
    use_custom_bot = use_custom,
    updated_at = now()
  FROM 
    public.communities c
  WHERE 
    c.owner_id = v_user_id AND
    tbs.community_id = c.id;
  
  -- Also update the user's profile to remember this preference
  UPDATE public.profiles
  SET 
    updated_at = now()
  WHERE 
    id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to use the function
GRANT EXECUTE ON FUNCTION public.set_bot_preference(BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_bot_preference(BOOLEAN) TO service_role;
