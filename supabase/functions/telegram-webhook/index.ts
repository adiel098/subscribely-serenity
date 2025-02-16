
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
  };
  my_chat_member?: {
    chat: {
      id: number;
      type: string;
    };
    from: {
      id: number;
      username?: string;
    };
    new_chat_member: {
      status: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // For direct Telegram webhook updates
    if (req.method === 'POST') {
      const update: TelegramUpdate = await req.json()
      console.log('Received Telegram update:', update)

      // Handle bot being added to a group
      if (update.my_chat_member) {
        const { chat, new_chat_member } = update.my_chat_member
        
        if (new_chat_member.status === 'administrator') {
          // Update the bot settings to mark as admin
          await supabase
            .from('telegram_bot_settings')
            .update({ 
              is_admin: true,
              chat_id: chat.id.toString()
            })
            .eq('chat_id', chat.id.toString())

          console.log(`Bot added as admin to chat ${chat.id}`)
          
          // You might want to send a welcome message here
          const welcomeMsg = "Thank you for adding me as an admin! I'm now ready to manage your community."
          await sendTelegramMessage(chat.id, welcomeMsg)
        }
      }

      // Handle new messages
      if (update.message) {
        const { chat, from, text } = update.message
        
        // Log the message (you might want to store it in the database)
        console.log(`Received message from ${from.username || from.id}: ${text}`)
        
        // Here you can add more message handling logic
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Handle bot management endpoints
    if (req.method === 'POST' && req.url.includes('/setup')) {
      const { communityId, token } = await req.json()
      
      // Store the bot token
      const { data, error } = await supabase
        .from('telegram_bot_settings')
        .upsert({
          community_id: communityId,
          bot_token: token,
        })
        .select()
        .single()

      if (error) throw error

      // Set up webhook for the bot
      const webhookUrl = `${req.url.split('/setup')[0]}`
      await setTelegramWebhook(token, webhookUrl)

      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to send Telegram messages
async function sendTelegramMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  })
  
  return response.json()
}

// Helper function to set up webhook for the bot
async function setTelegramWebhook(token: string, url: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        allowed_updates: ['message', 'my_chat_member'],
      }),
    }
  )
  
  return response.json()
}
