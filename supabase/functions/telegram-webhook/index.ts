
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { routeTelegramWebhook } from "./router/webhookRouter.ts";
import { corsHeaders } from "./cors.ts";
import { createLogger } from "./services/loggingService.ts";
import { handlePaymentCallback } from "./handlers/paymentCallbackHandler.ts";
import { handleUpdate } from "./handlers/updateHandler.ts";
import { getLogger, logToDatabase } from "./services/loggerService.ts";

const logger = getLogger('webhook-main');

serve(async (req) => {
  // Log all request details
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.debug(`Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    logger.debug('Handling CORS preflight request');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    // Log environment variables (but not their full values for security)
    logger.info(`Environment variables: 
      SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}, 
      SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}, 
      TELEGRAM_BOT_TOKEN: ${botToken ? '✅ Set' : '❌ Missing'}`);
    
    if (!supabaseUrl || !supabaseKey || !botToken) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract and log request body if it exists
    let requestBody = null;
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const clonedReq = req.clone();
        requestBody = await clonedReq.json();
        logger.debug(`Request body: ${JSON.stringify(requestBody)}`);
        await logToDatabase(supabase, 'WEBHOOK', 'INFO', 'Received webhook request', {
          url: req.url,
          method: req.method,
          body: requestBody
        });
      }
    } catch (e) {
      logger.warn(`Failed to parse request body: ${e.message}`);
    }
    
    return await routeTelegramWebhook(req, supabase, botToken);
  } catch (error) {
    logger.error(`Error processing request: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      location: 'webhook entry point'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
