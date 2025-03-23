
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { TelegramChannelDetector } from "./telegram/channelDetector.ts";

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

    // Initialize the channel detector with the bot token
    const detector = new TelegramChannelDetector(botToken);
    
    try {
      // First validate the bot token itself
      const botInfo = await detector.validateBotToken();
      if (!botInfo.valid) {
        return new Response(
          JSON.stringify({ 
            valid: false, 
            message: botInfo.message || 'Invalid bot token' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Get chats where bot is an admin
      const chatList = await detector.detectBotChats();
      
      // Return success response with bot and chat info
      return new Response(
        JSON.stringify({ 
          valid: true, 
          botUsername: botInfo.username,
          chatList: chatList,
          message: 'Bot validated successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error validating bot or detecting channels:', error);
      return new Response(
        JSON.stringify({ valid: false, message: error.message || 'Failed to validate bot' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in validate-bot-token function:', error);
    
    return new Response(
      JSON.stringify({ valid: false, message: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
