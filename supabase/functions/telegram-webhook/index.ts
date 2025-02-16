import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

console.log('🤖 Starting Telegram bot webhook...');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function logTelegramEvent(supabase: any, eventType: string, data: any, error?: string) {
  try {
    console.log(`Logging ${eventType} event:`, JSON.stringify(data, null, 2));
    
    const eventData = {
      event_type: eventType,
      chat_id: data.message?.chat?.id || data.chat?.id || data.chat_join_request?.chat?.id || data.my_chat_member?.chat?.id,
      user_id: data.message?.from?.id || data.from?.id || data.chat_join_request?.from?.id || data.my_chat_member?.from?.id,
      username: data.message?.from?.username || data.from?.username || data.chat_join_request?.from?.username || data.my_chat_member?.from?.username,
      message_id: data.message?.message_id,
      message_text: data.message?.text,
      raw_data: data,
      error: error
    };

    console.log('Prepared event data:', JSON.stringify(eventData, null, 2));

    const { error: checkError } = await supabase
      .from('telegram_events')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking telegram_events table:', checkError);
      return;
    }

    const { error: insertError } = await supabase
      .from('telegram_events')
      .insert([eventData]);

    if (insertError) {
      console.error('Error logging event:', insertError);
    } else {
      console.log('✅ Event logged successfully');
    }
  } catch (err) {
    console.error('Error in logTelegramEvent:', err);
  }
}

async function setupWebhook(botToken: string) {
  try {
    console.log('Setting up webhook...'); 
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
    console.log('Using webhook URL:', webhookUrl);
    
    const allowedUpdates = [
      "message",
      "edited_message",
      "channel_post",
      "edited_channel_post",
      "my_chat_member",
      "chat_member",
      "chat_join_request"
    ];
    
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: webhookUrl,
          allowed_updates: allowedUpdates
        })
      }
    );
    const result = await response.json();
    console.log('Webhook setup result:', result);
    return result;
  } catch (error) {
    console.error('Error in setupWebhook:', error);
    throw error;
  }
}

async function getWebhookInfo(botToken: string) {
  try {
    console.log('Getting webhook info...'); 
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
      { method: 'GET' }
    );
    const result = await response.json();
    console.log('Webhook info result:', result);
    return result;
  } catch (error) {
    console.error('Error in getWebhookInfo:', error);
    throw error;
  }
}

async function handleNewMessage(supabase: any, update: any) {
  try {
    console.log('🗨️ Processing new message:', JSON.stringify(update.message, null, 2));
    await logTelegramEvent(supabase, 'new_message', update);
  } catch (error) {
    console.error('Error in handleNewMessage:', error);
    throw error;
  }
}

async function handleChatJoinRequest(supabase: any, update: any) {
  try {
    console.log('👤 Processing chat join request:', JSON.stringify(update.chat_join_request, null, 2));
    await logTelegramEvent(supabase, 'chat_join_request', update);
  } catch (error) {
    console.error('Error in handleChatJoinRequest:', error);
    throw error;
  }
}

async function handleChannelPost(supabase: any, update: any) {
  try {
    console.log('📢 Processing channel post:', JSON.stringify(update.channel_post, null, 2));
    await logTelegramEvent(supabase, 'channel_post', update);
  } catch (error) {
    console.error('Error in handleChannelPost:', error);
    throw error;
  }
}

async function handleEditedMessage(supabase: any, update: any) {
  try {
    console.log('✏️ Processing edited message:', JSON.stringify(update.edited_message, null, 2));
    await logTelegramEvent(supabase, 'edited_message', update);
  } catch (error) {
    console.error('Error in handleEditedMessage:', error);
    throw error;
  }
}

async function handleLeftChatMember(supabase: any, update: any) {
  try {
    console.log('👋 Processing left chat member:', JSON.stringify(update.message?.left_chat_member, null, 2));
    await logTelegramEvent(supabase, 'left_chat_member', update);
  } catch (error) {
    console.error('Error in handleLeftChatMember:', error);
    throw error;
  }
}

async function handleNewChatMember(supabase: any, update: any) {
  try {
    console.log('🎉 Processing new chat members:', JSON.stringify(update.message?.new_chat_members || [update.message?.new_chat_member], null, 2));
    
    const newMembers = update.message?.new_chat_members || [update.message?.new_chat_member].filter(Boolean);
    
    for (const member of newMembers) {
      await logTelegramEvent(supabase, 'new_chat_member', {
        ...update,
        new_chat_member: member
      });
      
      console.log(`✨ New member joined: ${member.first_name} ${member.last_name || ''} (@${member.username || 'no username'})`);
    }
  } catch (error) {
    console.error('Error in handleNewChatMember:', error);
    throw error;
  }
}

async function handleMyChatMember(supabase: any, update: any) {
  try {
    console.log('👥 Processing my_chat_member update:', JSON.stringify(update.my_chat_member, null, 2));
    
    const chatMember = update.my_chat_member;
    if (chatMember.new_chat_member?.status === 'member' || 
        chatMember.new_chat_member?.status === 'administrator') {
      console.log('🎉 New channel membership detected!');
    }
    
    await logTelegramEvent(supabase, 'my_chat_member', update);
  } catch (error) {
    console.error('Error in handleMyChatMember:', error);
    throw error;
  }
}

async function handleChatMemberUpdate(supabase: any, update: any) {
  try {
    console.log('👥 Processing chat_member update:', JSON.stringify(update.chat_member, null, 2));
    
    const chatMember = update.chat_member;
    const { chat, from: member, new_chat_member, old_chat_member, invite_link } = chatMember;
    
    if (new_chat_member?.status === 'member' && old_chat_member?.status === 'left') {
      console.log('🎉 Member joined channel:', member.username);
      
      // First, let's find the community by chat_id
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chat.id.toString())
        .single();
        
      if (communityError) {
        console.error('Error finding community:', communityError);
        throw communityError;
      }
      
      if (!community) {
        console.error('Community not found for chat_id:', chat.id);
        throw new Error(`Community not found for chat_id: ${chat.id}`);
      }
      
      console.log('Found community:', community);
      
      // Check if there's an active payment with this invite link
      console.log('Checking for payment with invite link:', invite_link?.invite_link);
      const { data: payment, error: paymentError } = await supabase
        .from('subscription_payments')
        .select(`
          id,
          plan_id,
          subscription_plans:plan_id (
            interval
          )
        `)
        .eq('invite_link', invite_link?.invite_link)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (paymentError) {
        console.error('Error checking payment:', paymentError);
        throw paymentError;
      }

      let subscriptionStartDate = new Date();
      let subscriptionEndDate = null;
      let subscriptionPlanId = null;

      if (payment) {
        console.log('Found payment:', payment);
        subscriptionPlanId = payment.plan_id;
        
        // Calculate subscription end date based on plan interval
        if (payment.subscription_plans?.interval) {
          switch (payment.subscription_plans.interval) {
            case 'monthly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
              break;
            case 'quarterly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
              break;
            case 'half-yearly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
              break;
            case 'yearly':
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
              break;
            case 'one-time':
              // For one-time payments, set end date to 100 years from now (effectively unlimited)
              subscriptionEndDate = new Date(subscriptionStartDate);
              subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
              break;
          }
        }
      }
      
      // Check if member already exists
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('telegram_chat_members')
        .select('id')
        .eq('community_id', community.id)
        .eq('telegram_user_id', member.id.toString())
        .maybeSingle();
        
      if (memberCheckError) {
        console.error('Error checking existing member:', memberCheckError);
        throw memberCheckError;
      }
      
      const memberData = {
        telegram_username: member.username,
        is_active: true,
        last_active: new Date().toISOString(),
        subscription_status: Boolean(payment),
        subscription_plan_id: subscriptionPlanId,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate?.toISOString() || null
      };
      
      if (existingMember) {
        console.log('Member already exists, updating with:', memberData);
        const { error: updateError } = await supabase
          .from('telegram_chat_members')
          .update(memberData)
          .eq('id', existingMember.id);
          
        if (updateError) {
          console.error('Error updating member:', updateError);
          throw updateError;
        }
      } else {
        console.log('Creating new member with:', memberData);
        const { error: insertError } = await supabase
          .from('telegram_chat_members')
          .insert([{
            community_id: community.id,
            telegram_user_id: member.id.toString(),
            joined_at: new Date().toISOString(),
            ...memberData
          }]);
          
        if (insertError) {
          console.error('Error inserting member:', insertError);
          throw insertError;
        }
      }
      
      console.log('✅ Successfully processed new member');
    } else if (new_chat_member?.status === 'left' && old_chat_member?.status === 'member') {
      console.log('👋 Member left channel:', member.username);
      
      // Find the community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('id')
        .eq('telegram_chat_id', chat.id.toString())
        .single();
        
      if (communityError) {
        console.error('Error finding community:', communityError);
        throw communityError;
      }
      
      if (!community) {
        console.error('Community not found for chat_id:', chat.id);
        throw new Error(`Community not found for chat_id: ${chat.id}`);
      }
      
      // Update member status
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          is_active: false,
          subscription_status: false,
          subscription_end_date: new Date().toISOString()
        })
        .eq('community_id', community.id)
        .eq('telegram_user_id', member.id.toString());
        
      if (updateError) {
        console.error('Error updating member status:', updateError);
        throw updateError;
      }
      
      console.log('✅ Successfully processed member departure');
    }
    
    await logTelegramEvent(supabase, 'chat_member', update);
  } catch (error) {
    console.error('Error in handleChatMemberUpdate:', error);
    throw error;
  }
}

serve(async (req) => {
  console.log(`🔄 Received ${req.method} request to ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // בדיקת חיבור ל-Supabase
    try {
      const { error: connectionError } = await supabase
        .from('telegram_events')
        .select('id')
        .limit(1);

      if (connectionError) {
        console.error('Error connecting to Supabase:', connectionError);
        return new Response(
          JSON.stringify({ 
            ok: true,
            error: 'Database connection error',
            details: connectionError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    } catch (error) {
      console.error('Error testing database connection:', error);
      return new Response(
        JSON.stringify({ 
          ok: true,
          error: 'Database connection test failed',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    console.log('Fetching bot token from settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError) {
      console.error('Error fetching bot token:', settingsError);
      return new Response(
        JSON.stringify({ 
          ok: true,
          error: 'Failed to fetch bot token',
          details: settingsError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (!settings?.bot_token) {
      console.error('Bot token is missing from settings');
      return new Response(
        JSON.stringify({ 
          ok: true,
          error: 'Bot token is missing'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const BOT_TOKEN = settings.bot_token;
    console.log('✅ Successfully retrieved bot token');

    const url = new URL(req.url);
    if (url.pathname.endsWith('/check')) {
      console.log('Running webhook check...');
      try {
        const webhookInfo = await getWebhookInfo(BOT_TOKEN);
        const setupResult = await setupWebhook(BOT_TOKEN);
        
        return new Response(
          JSON.stringify({ webhookInfo, setupResult }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error('Error during webhook check:', error);
        return new Response(
          JSON.stringify({ 
            ok: true,
            error: 'Error checking webhook status',
            details: error.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    if (req.method === 'POST') {
      console.log('Handling webhook update...');
      try {
        const update = await req.json();
        console.log('📥 Received update:', JSON.stringify(update, null, 2));

        // Log raw update for debugging
        await logTelegramEvent(supabase, 'raw_update', update);

        // Handle different types of updates
        if (update.message) {
          if (update.message.new_chat_members || update.message.new_chat_member) {
            await handleNewChatMember(supabase, update);
          } else if (update.message.left_chat_member) {
            await handleLeftChatMember(supabase, update);
          } else {
            await handleNewMessage(supabase, update);
          }
        }

        if (update.my_chat_member) {
          await handleMyChatMember(supabase, update);
        }

        if (update.chat_member) {
          await handleChatMemberUpdate(supabase, update);
        }

        if (update.chat_join_request) {
          await handleChatJoinRequest(supabase, update);
        }

        if (update.channel_post) {
          await handleChannelPost(supabase, update);
        }

        if (update.edited_message) {
          await handleEditedMessage(supabase, update);
        }

        console.log('✅ Successfully processed update');
        return new Response(
          JSON.stringify({ ok: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error('Error processing webhook update:', error);
        // נרשום את השגיאה ב-DB ונחזיר תשובה תקינה לטלגרם
        await logTelegramEvent(supabase, 'error', {}, error.message);
        return new Response(
          JSON.stringify({ ok: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        ok: true,
        error: 'Invalid request method' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({ ok: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
