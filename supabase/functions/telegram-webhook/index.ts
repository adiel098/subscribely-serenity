
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { routeTelegramWebhook } from "./router/webhookRouter.ts";
import { corsHeaders } from "./cors.ts";
import { createLogger } from "./services/loggingService.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const logger = createLogger(supabase, 'WEBHOOK-MAIN');

    await logger.info('👋 Received webhook request');
    
    return await routeTelegramWebhook(req, supabase, botToken);
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
