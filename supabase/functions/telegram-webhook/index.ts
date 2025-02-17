
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { sendBroadcastMessage } from './broadcastHandler.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const body = await req.json();
    console.log('Received webhook request:', body);
    
    // בדיקה אם זו קריאת broadcast
    if (body.type === 'broadcast') {
      console.log('Processing broadcast request:', body);
      
      const status = await sendBroadcastMessage(
        createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        ),
        body.communityId,
        body.message,
        body.filterType || 'all',
        body.subscriptionPlanId,
        body.includeButton,
        body.recipients
      );

      return new Response(JSON.stringify(status), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      });
    }

    // Handle other types of requests
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
