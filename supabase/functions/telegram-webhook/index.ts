
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Bot, webhookCallback } from "../_utils/telegramClient.ts"
import { corsHeaders } from "./cors.ts"
import { handleMessage } from "./handlers/messageHandler.ts"
import { handleChatMember } from "./handlers/chatMemberHandler.ts"
import { handleJoinRequest } from "./handlers/joinRequestHandler.ts"
import { updateMemberActivity } from "./handlers/activityHandler.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // בדיקה אם זה עדכון פעילות
    if (path === 'update-activity') {
      const { communityId } = await req.json()
      
      if (!communityId) {
        return new Response(
          JSON.stringify({ error: 'Community ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const result = await updateMemberActivity(supabaseClient, communityId)
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // בדיקה אם זה ברודקאסט
    if (path === 'broadcast') {
      const { communityId, message, filterType, subscriptionPlanId, includeButton } = await req.json()
      
      if (!communityId || !message) {
        return new Response(
          JSON.stringify({ error: 'Community ID and message are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const bot = new Bot(Deno.env.get('TELEGRAM_BOT_TOKEN') || '')
      const result = await handleBroadcast(bot, supabaseClient, communityId, message, filterType, subscriptionPlanId, includeButton)
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // טיפול בעדכונים מטלגרם
    const bot = new Bot(Deno.env.get('TELEGRAM_BOT_TOKEN') || '')
    
    bot.on('message', async (ctx) => {
      await handleMessage(bot, ctx, supabaseClient)
    })

    bot.on('chat_member', async (ctx) => {
      await handleChatMember(ctx, supabaseClient)
    })

    bot.on('chat_join_request', async (ctx) => {
      await handleJoinRequest(ctx, supabaseClient)
    })

    const handler = webhookCallback(bot, 'std/http')
    const response = await handler(req)
    
    // הוספת CORS headers לתשובה
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response

  } catch (error) {
    console.error('Error in webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
