
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { startParam } = await req.json();
    
    console.log("Processing request with startParam:", startParam);
    
    if (!startParam) {
      return new Response(
        JSON.stringify({ error: "Missing startParam" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // First check if this is a user ID directly
    if (/^\d+$/.test(startParam)) {
      console.log("startParam appears to be a user ID:", startParam);
      
      // Check if we have this user in our database
      const { data: existingUser, error: dbError } = await supabase
        .from('telegram_mini_app_users')
        .select('*')
        .eq('telegram_id', startParam)
        .maybeSingle();
      
      if (dbError) {
        console.error("Database error:", dbError);
      }
      
      if (existingUser) {
        console.log("Found existing user in database:", existingUser);
        
        return new Response(
          JSON.stringify({
            user: {
              id: existingUser.telegram_id,
              first_name: existingUser.first_name || "",
              last_name: existingUser.last_name || "",
              username: existingUser.username || "",
              email: existingUser.email || null
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // If we don't have the user in our database, we might need to fetch from Telegram API
      // But we'd need more info like first name, last name that we don't have
      // For now, just return the ID we have
      return new Response(
        JSON.stringify({
          user: {
            id: startParam,
            first_name: "",
            last_name: "",
            username: "",
            email: null
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If not a direct user ID, check if it's a special payload format
    // This could be a community ID + user ID combination
    // Or some other format defined by your application
    
    // Check if the startParam matches any community IDs
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name')
      .eq('id', startParam)
      .maybeSingle();
    
    if (communityError) {
      console.error("Error checking for community:", communityError);
    }
    
    if (community) {
      console.log("Found community:", community);
      // In this case, we don't have user information directly
      // But we know which community they're trying to access
      
      return new Response(
        JSON.stringify({
          community: community,
          user: null // We don't have user information yet
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If we can't identify the startParam, return an error
    return new Response(
      JSON.stringify({ error: "Could not process the start parameter" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
