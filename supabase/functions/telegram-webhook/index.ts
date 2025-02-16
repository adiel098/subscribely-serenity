
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
)

async function logWebhookEvent(eventType: string, payload: any, error?: string) {
  try {
    const { data, error: logError } = await supabase
      .from('telegram_webhook_logs')
      .insert([
        {
          event_type: eventType,
          payload,
          error
        }
      ]);

    if (logError) {
      console.error('Error logging webhook event:', logError);
    }
  } catch (e) {
    console.error('Error in logWebhookEvent:', e);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    await logWebhookEvent('OPTIONS_REQUEST', {
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the global bot token
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      const error = 'Failed to get bot settings or bot token is missing';
      await logWebhookEvent('BOT_TOKEN_ERROR', { error: settingsError }, error);
      throw new Error(error);
    }

    const BOT_TOKEN = settings.bot_token;

    // For webhook updates
    if (req.method === 'POST') {
      try {
        const update = await req.json();
        await logWebhookEvent('TELEGRAM_UPDATE', update);

        if (update.message?.new_chat_member) {
          await logWebhookEvent('NEW_MEMBER', {
            chatId: update.message.chat.id,
            userId: update.message.new_chat_member.id,
            username: update.message.new_chat_member.username
          });

          // Get chat member info
          const memberResponse = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chat_id: update.message.chat.id,
                user_id: update.message.new_chat_member.id
              })
            }
          );
          
          const memberInfo = await memberResponse.json();
          await logWebhookEvent('MEMBER_INFO', memberInfo);

          // Handle member info
          if (memberInfo.ok) {
            const { data: community } = await supabase
              .from('communities')
              .select('id')
              .eq('telegram_chat_id', update.message.chat.id.toString())
              .single();

            if (community) {
              const { error: memberError } = await supabase
                .from('telegram_chat_members')
                .upsert({
                  community_id: community.id,
                  telegram_user_id: update.message.new_chat_member.id.toString(),
                  telegram_username: update.message.new_chat_member.username,
                  is_active: true,
                  joined_at: new Date().toISOString()
                });

              if (memberError) {
                await logWebhookEvent('MEMBER_INSERT_ERROR', { error: memberError });
              } else {
                await logWebhookEvent('MEMBER_INSERTED', {
                  communityId: community.id,
                  userId: update.message.new_chat_member.id
                });
              }
            }
          }
        }

        if (update.message?.text) {
          await logWebhookEvent('MESSAGE', {
            chatId: update.message.chat.id,
            text: update.message.text,
            from: update.message.from
          });
        }

        // Handle successful pre_checkout_query
        if (update.pre_checkout_query) {
          await logWebhookEvent('PRE_CHECKOUT', update.pre_checkout_query);
          
          const response = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                pre_checkout_query_id: update.pre_checkout_query.id,
                ok: true
              })
            }
          );
          
          const result = await response.json();
          await logWebhookEvent('PRE_CHECKOUT_RESPONSE', result);
        }

        // Handle successful payment
        if (update.message?.successful_payment) {
          await logWebhookEvent('SUCCESSFUL_PAYMENT', update.message.successful_payment);
          
          const { telegram_payment_id, total_amount, currency } = update.message.successful_payment;
          
          const payment = {
            telegram_payment_id,
            amount: total_amount / 100, // Convert from cents to dollars
            telegram_user_id: update.message.from.id.toString(),
            status: 'completed',
            payment_method: 'telegram'
          };
          
          const { error: paymentError } = await supabase
            .from('subscription_payments')
            .upsert(payment);

          if (paymentError) {
            await logWebhookEvent('PAYMENT_INSERT_ERROR', { error: paymentError });
          } else {
            await logWebhookEvent('PAYMENT_INSERTED', payment);
          }
        }
      } catch (parseError) {
        await logWebhookEvent('PARSE_ERROR', {}, parseError.message);
        throw parseError;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    await logWebhookEvent('GENERAL_ERROR', {}, error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
