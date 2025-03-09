
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { setupWebhookConfig } from './config/webhookConfig.ts';
import { routeTelegramWebhook } from './router/webhookRouter.ts';
import { corsHeaders } from './cors.ts';

console.log("[WEBHOOK] 🚀 Starting webhook service...");

serve(async (req) => {
  console.log(`[WEBHOOK] 📥 Received ${req.method} request`);
  
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      console.log("[WEBHOOK] ✅ Handling CORS preflight request");
      return new Response('ok', { headers: corsHeaders });
    }

    // Setup configuration (Supabase client, bot token)
    const config = await setupWebhookConfig();
    
    // Route the webhook request based on content
    return await routeTelegramWebhook(req, config.supabaseClient, config.botToken);

  } catch (error) {
    console.error('[WEBHOOK] ❌ Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
