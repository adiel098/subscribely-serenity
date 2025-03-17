
import { supabase } from "@/integrations/supabase/client";

/**
 * Invokes a Supabase Edge Function
 * 
 * @param functionName The name of the edge function to invoke
 * @param payload The payload to send to the function
 * @returns The response from the edge function
 */
export const invokeSupabaseFunction = async (functionName: string, payload: any) => {
  try {
    console.log(`Invoking edge function: ${functionName}`);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    if (error) {
      console.error(`Error invoking function ${functionName}:`, error);
      throw error;
    }
    
    console.log(`Successfully invoked function ${functionName}`);
    return { data, error: null };
  } catch (error) {
    console.error(`Exception invoking function ${functionName}:`, error);
    return { data: null, error };
  }
};

/**
 * Creates a database function to get plans for a community
 * This is just a mock function definition to show the concept
 */
export const createGetPlansRpcFunction = `
CREATE OR REPLACE FUNCTION get_community_plans(community_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  interval TEXT,
  features JSONB,
  is_active BOOLEAN,
  community_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    sp.description,
    sp.price,
    sp.interval,
    sp.features,
    sp.is_active,
    sp.community_id,
    sp.created_at,
    sp.updated_at
  FROM subscription_plans sp
  WHERE sp.community_id = community_id_param
  AND sp.is_active = true;
END;
$$;
`;
