
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "./cors.ts";
import { handleMessage } from "./handlers/messageHandler.ts";
import { handleChatMemberUpdate } from "./handlers/chatMemberHandler.ts";
import { handleJoinRequest } from "./handlers/joinRequestHandler.ts";
import { handleWebhookUpdate } from "./webhookManager.ts";
import { sendBroadcastMessage } from "./broadcastHandler.ts";
import { processActivity } from "./handlers/activityHandler.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { path, update, communityId, message, filterType, subscriptionPlanId, includeButton } = await req.json();

    // Process different paths
    switch (path) {
      case '/webhook':
        return await handleWebhookUpdate(supabase, update);
      case '/message':
        return await handleMessage(supabase, update);
      case '/chat-member':
        return await handleChatMemberUpdate(supabase, update);
      case '/join-request':
        return await handleJoinRequest(supabase, update);
      case '/broadcast':
        if (!communityId || !message) {
          throw new Error('Missing required parameters for broadcast');
        }
        const result = await sendBroadcastMessage(
          supabase, 
          communityId, 
          message, 
          filterType, 
          subscriptionPlanId,
          includeButton
        );
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      case '/activity':
        return await processActivity(supabase, update);
      default:
        throw new Error(`Unknown path: ${path}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
