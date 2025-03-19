
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { getLogger } from './services/loggerService.ts';
import { routeTelegramWebhook } from './router/webhookRouter.ts';

// Initialize logger for the main entrypoint
const logger = getLogger('webhook-main');

// Handle all incoming requests to the function
serve(async (req) => {
  logger.info(`Received ${req.method} request to telegram-webhook`);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    logger.info('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
    
    // Validate required environment variables
    if (!supabaseUrl || !supabaseKey) {
      logger.error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      throw new Error('Server configuration error: Missing Supabase credentials');
    }
    
    if (!botToken) {
      logger.error('Missing required environment variable: TELEGRAM_BOT_TOKEN');
      throw new Error('Server configuration error: Missing Telegram bot token');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase client initialized');
    
    // Route the webhook to the appropriate handler
    return await routeTelegramWebhook(req, supabase, botToken);
  } catch (error) {
    logger.error(`Uncaught error in webhook handler: ${error.message}`, error);
    
    // Return error response
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

logger.info('Telegram webhook edge function initialized');
