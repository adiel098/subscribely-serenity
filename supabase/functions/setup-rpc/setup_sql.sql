
-- Function to safely add communities to a group
CREATE OR REPLACE FUNCTION add_communities_to_group(
  group_id UUID,
  community_ids UUID[]
) RETURNS SETOF community_group_members AS $$
DECLARE
  v_group_owner_id UUID;
  v_community_id UUID;
  v_display_order INTEGER := 0;
  v_result community_group_members;
BEGIN
  -- Check if the group exists and get owner
  SELECT owner_id INTO v_group_owner_id 
  FROM communities 
  WHERE id = group_id AND is_group = true;
  
  -- Verify the current user owns the group
  IF v_group_owner_id IS NULL OR v_group_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to add communities to this group';
  END IF;
  
  -- Loop through community IDs and add them to the group
  FOREACH v_community_id IN ARRAY community_ids
  LOOP
    -- Insert the community as a group member
    INSERT INTO community_group_members (
      parent_id,
      community_id,
      display_order
    )
    VALUES (
      group_id,
      v_community_id,
      v_display_order
    )
    RETURNING * INTO v_result;
    
    -- Return the newly created record
    RETURN NEXT v_result;
    
    -- Increment display order for next community
    v_display_order := v_display_order + 1;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to be called by setup-rpc edge function
CREATE OR REPLACE FUNCTION setup_rpc_functions()
RETURNS TEXT AS $$
BEGIN
  -- The function already creates/replaces the add_communities_to_group function
  RETURN 'RPC functions created successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to get admin users
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS SETOF admin_users AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fix admin related infinite recursion
CREATE OR REPLACE FUNCTION get_admin_status(user_id_param UUID)
RETURNS TABLE(is_admin BOOLEAN, admin_role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM public.admin_users WHERE user_id = user_id_param) as is_admin,
    (SELECT role::text FROM public.admin_users WHERE user_id = user_id_param) as admin_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available payment methods with fixed column references
CREATE OR REPLACE FUNCTION get_available_payment_methods(community_id_param uuid)
RETURNS TABLE(
  id uuid, 
  provider text, 
  is_active boolean, 
  is_default boolean, 
  config jsonb, 
  community_id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  -- Get all specific payment methods for the community
  SELECT 
    pm.id,
    pm.provider,
    pm.is_active,
    pm.is_default,
    pm.config,
    pm.community_id,
    pm.created_at,
    pm.updated_at
  FROM payment_methods pm
  WHERE pm.community_id = community_id_param
  
  UNION ALL
  
  -- Add default payment methods that don't conflict with the current community's payment methods
  SELECT 
    pm.id,
    pm.provider,
    pm.is_active,
    pm.is_default,
    pm.config,
    pm.community_id,
    pm.created_at,
    pm.updated_at
  FROM payment_methods pm
  JOIN communities c ON c.owner_id = (SELECT owner_id FROM communities WHERE id = community_id_param)
  WHERE pm.is_default = TRUE
  AND pm.community_id != community_id_param
  AND NOT EXISTS (
    -- Check if there's already a payment method of the same type for the current community
    SELECT 1 FROM payment_methods 
    WHERE community_id = community_id_param 
    AND provider = pm.provider
  );
END;
$$ LANGUAGE plpgsql;
