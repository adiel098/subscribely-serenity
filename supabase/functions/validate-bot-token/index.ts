
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { botToken } = await req.json();
    
    // Check if we have required fields
    if (!botToken) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Bot token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate the bot token by calling Telegram API
    const botResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const botData = await botResponse.json();

    if (!botResponse.ok || !botData.ok) {
      console.error('Invalid bot token:', botData);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: botData.description || 'Invalid bot token' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const botUsername = botData.result.username;
    console.log(`Bot validated: ${botUsername}`);

    // Get bot chat information
    const chatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    const chatData = await chatResponse.json();
    
    console.log("Chat updates data:", chatData);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        valid: true, 
        botUsername: botUsername,
        chatData: chatData.result || [],
        message: 'Bot validated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in validate-bot-token function:', error);
    
    return new Response(
      JSON.stringify({ valid: false, message: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
