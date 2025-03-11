
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { routeTelegramWebhook } from "./router/webhookRouter.ts";
import { corsHeaders } from "./cors.ts";
import { createLogger } from "./services/loggingService.ts";
import { handlePaymentCallback } from "./handlers/paymentCallbackHandler.ts";
import { handleUpdate } from "./handlers/updateHandler.ts";

serve(async (req) => {
  // Log all request details
  console.log(`👋 [WEBHOOK] Received ${req.method} request to ${req.url}`);
  console.log(`👋 [WEBHOOK] Headers:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('👋 [WEBHOOK] Handling CORS preflight request');
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
    console.log(`👋 [WEBHOOK] Environment variables: 
      SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}, 
      SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}, 
      TELEGRAM_BOT_TOKEN: ${botToken ? '✅ Set' : '❌ Missing'}`);
    
    if (!supabaseUrl || !supabaseKey || !botToken) {
      throw new Error('Missing required environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const logger = createLogger(supabase, 'WEBHOOK-MAIN');

    await logger.info('👋 Received webhook request');
    
    return await routeTelegramWebhook(req, supabase, botToken);
  } catch (error) {
    console.error('❌ [WEBHOOK] Error processing request:', error);
    console.error('❌ [WEBHOOK] Stack trace:', error.stack);
    
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
