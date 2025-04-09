
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    
    if (!projectId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Project ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the project's bot token
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('is_custom_bot, bot_token')
      .eq('id', projectId)
      .single();
      
    if (projectError) {
      console.error('Error fetching project:', projectError);
      return new Response(
        JSON.stringify({ success: false, message: 'Project not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // If no custom bot or token not set, get the default bot token
    if (!project.is_custom_bot || !project.bot_token) {
      const { data: globalSettings, error: globalError } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .limit(1)
        .single();
        
      if (globalError || !globalSettings?.bot_token) {
        console.error('Error fetching global bot token:', globalError);
        return new Response(
          JSON.stringify({ success: false, message: 'Default bot token not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          useCustomBot: false, 
          botToken: globalSettings.bot_token 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the custom bot token
    return new Response(
      JSON.stringify({ 
        success: true, 
        useCustomBot: true, 
        botToken: project.bot_token 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-project-bot function:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
