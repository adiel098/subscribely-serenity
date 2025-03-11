
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { logger } from './logger.ts';

/**
 * Create Supabase client with proper error handling
 */
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    logger.error("Missing Supabase credentials");
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(supabaseUrl, supabaseKey);
}
