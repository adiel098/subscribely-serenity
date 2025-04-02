
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';
import { sendBroadcastHandler } from './handlers/broadcastHandler.ts';

const logger = createLogger('send-broadcast');

// Initialize the Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Send broadcast function loaded!");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { method, url } = req;
    logger.log(`Received ${method} request to ${url}`);
    
    // Extract path
    const reqUrl = new URL(url);
    const path = reqUrl.pathname.split('/').pop();

    // Check if method is POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, message: 'Only POST requests are allowed' }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    logger.log(`Request data: ${JSON.stringify(requestData)}`);

    // Get Telegram Bot token from environment or request
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || requestData.botToken;
    
    if (!botToken) {
      logger.error('No Telegram Bot token provided!');
      return new Response(
        JSON.stringify({ success: false, message: 'No Telegram Bot token provided' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle broadcast
    const result = await sendBroadcastHandler(supabase, botToken, requestData);
    
    return new Response(
      JSON.stringify(result),
      { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error(`Error in broadcast function: ${error.message}`);
    return new Response(
      JSON.stringify({ success: false, message: `Error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
