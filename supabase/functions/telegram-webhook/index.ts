import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

console.log('������� Telegram bot webhook is running...');

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
      first_name?: string;
      last_name?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    new_chat_member?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    text?: string;
  };
  channel_post?: {
    message_id: number;
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    text?: string;
  };
  my_chat_member?: {
    chat: {
      id: number;
      type: string;
      title?: string;
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

async function setupWebhook(botToken: string) {
  console.log('Setting up webhook...'); 
  const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
  console.log('Using webhook URL:', webhookUrl);
  console.log('Using bot token:', `${botToken.slice(0, 5)}...${botToken.slice(-5)}`);
  
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/setWebhook`,
    { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: webhookUrl })
    }
  );
  const result = await response.json();
  console.log('Webhook setup result:', result);
  return result;
}

async function getWebhookInfo(botToken: string) {
  console.log('Getting webhook info...'); 
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
    { method: 'GET' }
  );
  const result = await response.json();
  console.log('Webhook info result:', result);
  return result;
}

async function createInviteLink(botToken: string, chatId: number) {
  console.log('Creating invite link for chat:', chatId);
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/createChatInviteLink`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        member_limit: 1,
        creates_join_request: true
      })
    }
  );
  const result = await response.json();
  console.log('Invite link creation result:', result);
  return result;
}

async function findCommunityAndPaymentByTelegramChatId(supabase: any, chatId: string) {
  console.log('Finding community and latest payment for chat ID:', chatId);
  
  // Get the community first
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('telegram_chat_id', chatId)
    .single();

  if (communityError || !community) {
    console.error('Error finding community:', communityError);
    return null;
  }

  // Get the latest payment for this community that hasn't been used yet
  const { data: payment, error: paymentError } = await supabase
    .from('subscription_payments')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('community_id', community.id)
    .eq('status', 'completed')
    .is('telegram_user_id', null)  // Only get payments that haven't been assigned to a user yet
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (paymentError) {
    console.error('Error finding payment:', paymentError);
    return null;
  }

  return { community, payment };
}

async function findCommunityAndPaymentByInviteLink(supabase: any, chatId: string, inviteLink: string) {
  console.log('Finding community and payment for chat ID:', chatId, 'and invite link:', inviteLink);
  
  // Get the community first
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('*')
    .eq('telegram_chat_id', chatId)
    .single();

  if (communityError || !community) {
    console.error('Error finding community:', communityError);
    return null;
  }

  // Get the payment associated with this specific invite link
  const { data: payment, error: paymentError } = await supabase
    .from('subscription_payments')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('community_id', community.id)
    .eq('status', 'completed')
    .eq('invite_link', inviteLink)
    .is('telegram_user_id', null)  // Only if not already assigned
    .single();

  if (paymentError) {
    console.error('Error finding payment:', paymentError);
    return null;
  }

  return { community, payment };
}

serve(async (req) => {
  console.log(`🔄 Received ${req.method} request to ${new URL(req.url).pathname}`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the global bot token
    console.log('Fetching bot token from settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error('Failed to get bot settings:', settingsError);
      throw new Error('Failed to get bot settings or bot token is missing');
    }

    const BOT_TOKEN = settings.bot_token;
    console.log('✅ Successfully retrieved bot token');
    
    // Special endpoint to check webhook status
    const url = new URL(req.url);
    if (url.pathname.endsWith('/check')) {
      console.log('Running webhook check...');
      const webhookInfo = await getWebhookInfo(BOT_TOKEN);
      const setupResult = await setupWebhook(BOT_TOKEN);
      return new Response(
        JSON.stringify({ webhookInfo, setupResult }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // For direct Telegram webhook updates
    if (req.method === 'POST') {
      const update: TelegramUpdate = await req.json()
      console.log('📥 Received Telegram update:', JSON.stringify(update, null, 2))

      // Handle new member joining
      if (update.message?.new_chat_member) {
        const chatId = update.message.chat.id.toString();
        const newMember = update.message.new_chat_member;
        console.log('New member joined:', newMember);

        // Get the most recent message that added this user to get the invite link used
        const response = await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: chatId,
              user_id: newMember.id
            })
          }
        );
        
        const chatMemberInfo = await response.json();
        console.log('Chat member info:', chatMemberInfo);
        
        if (chatMemberInfo.ok && chatMemberInfo.result.invite_link) {
          const inviteLink = chatMemberInfo.result.invite_link;
          
          // Find the community and payment using the specific invite link
          const result = await findCommunityAndPaymentByInviteLink(supabase, chatId, inviteLink);
          
          if (result) {
            const { community, payment } = result;

            console.log('Creating telegram_chat_members record with:', {
              community_id: community.id,
              telegram_user_id: newMember.id.toString(),
              telegram_username: newMember.username,
              subscription_status: true,
              subscription_start_date: new Date().toISOString(),
              subscription_end_date: payment?.plan?.interval === 'monthly' 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
                : payment?.plan?.interval === 'yearly'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                : null,
              subscription_plan_id: payment?.plan?.id || null,
              is_active: true,
              joined_at: new Date().toISOString(),
              last_active: new Date().toISOString(),
              total_messages: 0
            });

            // Create telegram_chat_members record with exact table structure
            const { error: memberError } = await supabase
              .from('telegram_chat_members')
              .insert({
                community_id: community.id,
                telegram_user_id: newMember.id.toString(),
                telegram_username: newMember.username || null,
                subscription_status: true,
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: payment?.plan?.interval === 'monthly' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
                  : payment?.plan?.interval === 'yearly'
                  ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                  : null,
                subscription_plan_id: payment?.plan?.id || null,
                is_active: true,
                joined_at: new Date().toISOString(),
                last_active: new Date().toISOString(),
                total_messages: 0
              });

            if (memberError) {
              console.error('Error creating member record:', memberError);
              console.error('Error details:', JSON.stringify(memberError, null, 2));
            } else {
              console.log('Successfully created member record');

              // Update the payment record with the telegram user ID
              if (payment) {
                const { error: updateError } = await supabase
                  .from('subscription_payments')
                  .update({ 
                    telegram_user_id: newMember.id.toString()
                  })
                  .eq('id', payment.id);

                if (updateError) {
                  console.error('Error updating payment record:', updateError);
                } else {
                  console.log('Successfully updated payment record');
                }
              }
            }
          } else {
            console.log('No matching payment found for invite link:', inviteLink);
          }
        } else {
          console.log('Could not retrieve invite link information');
        }
      }

      const messageText = update.message?.text || update.channel_post?.text;
      const chatId = update.message?.chat.id || update.channel_post?.chat.id;
      const messageId = update.message?.message_id || update.channel_post?.message_id;
      const chatType = update.message?.chat.type || update.channel_post?.chat.type;
      const chatTitle = update.message?.chat.title || update.channel_post?.chat.title;
      const userId = update.message?.from?.id;

      console.log('Message text:', messageText);
      console.log('Chat ID:', chatId);
      console.log('Chat type:', chatType);
      console.log('User ID:', userId);

      // Handle /start command with community ID
      if (messageText?.startsWith('/start') && userId) {
        const communityId = messageText.split(' ')[1]; // Get the community ID after /start
        console.log('Start command received with community ID:', communityId);

        if (communityId) {
          // Get community details
          const { data: community, error: communityError } = await supabase
            .from('communities')
            .select('*')
            .eq('id', communityId)
            .single();

          if (communityError || !community) {
            console.error('Error finding community:', communityError);
            const errorMessage = "Sorry, I couldn't find this community.";
            await sendTelegramMessage(BOT_TOKEN, userId, errorMessage);
            return new Response(JSON.stringify({ success: true }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }

          // Create welcome message with Mini App button
          const welcomeMessage = `👋 Welcome! You're about to join *${community.name}*`;
          const replyMarkup = {
            inline_keyboard: [[
              {
                text: "🚀 Open Mini App",
                web_app: {
                  url: `https://preview--subscribely-serenity.lovable.app/telegram-mini-app?start=${communityId}`
                }
              }
            ]]
          };

          // Send message with button
          await sendTelegramMessageWithMarkup(BOT_TOKEN, userId, welcomeMessage, replyMarkup);
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
      }

      // Handle verification messages
      if (messageText?.startsWith('MBF_') && chatId && messageId) {
        console.log(`🔑 Processing verification code ${messageText} for chat ${chatId}`);
        
        // Get chat info from Telegram to fetch the photo
        const chatInfoResponse = await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/getChat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ chat_id: chatId })
          }
        );
        
        const chatInfo = await chatInfoResponse.json();
        console.log('Chat info:', chatInfo);
        
        let photoUrl = null;
        if (chatInfo.ok && chatInfo.result.photo) {
          // Get the file path
          const fileResponse = await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/getFile`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ file_id: chatInfo.result.photo.big_file_id })
            }
          );
          
          const fileInfo = await fileResponse.json();
          console.log('File info:', fileInfo);
          
          if (fileInfo.ok) {
            photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.result.file_path}`;
          }
        }

        // Create invite link for the chat
        const inviteLinkResult = await createInviteLink(BOT_TOKEN, chatId);
        const inviteLink = inviteLinkResult.ok ? inviteLinkResult.result.invite_link : null;

        // Find profile with this verification code
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('current_telegram_code', messageText.trim())
          .limit(1);

        if (profileError || !profiles?.length) {
          console.error('❌ Error finding profile:', profileError);
          return new Response(
            JSON.stringify({ error: 'Failed to find profile' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }

        const userId = profiles[0].id;

        // Create community with photo URL and invite link
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .insert({
            owner_id: userId,
            platform: 'telegram',
            name: chatTitle || 'My Telegram Community',
            platform_id: chatId.toString(),
            telegram_chat_id: chatId.toString(),
            telegram_photo_url: photoUrl,
            telegram_invite_link: inviteLink
          })
          .select()
          .single();

        if (communityError) {
          console.error('❌ Error creating community:', communityError);
          return new Response(
            JSON.stringify({ error: 'Failed to create community' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Set up and verify bot settings
        const { error: botSettingsError } = await supabase
          .from('telegram_bot_settings')
          .insert({
            community_id: community.id,
            chat_id: chatId.toString(),
            verification_code: messageText.trim(),
            verified_at: new Date().toISOString(),
            is_admin: true
          });

        if (botSettingsError) {
          console.error('❌ Error creating bot settings:', botSettingsError);
          return new Response(
            JSON.stringify({ error: 'Failed to create bot settings' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Delete the verification message
        const deleteResult = await deleteTelegramMessage(BOT_TOKEN, chatId, messageId);
        console.log('🗑️ Delete message result:', deleteResult);

        // Send success message
        const successMessage = "✅ Successfully connected to Membify!";
        const messageResult = await sendTelegramMessage(BOT_TOKEN, chatId, successMessage);
        console.log('✉️ Success message result:', messageResult);
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Handle bot being added to a group
      if (update.my_chat_member?.new_chat_member.status === 'administrator') {
        const chatId = update.my_chat_member.chat.id;
        const chatType = update.my_chat_member.chat.type;
        console.log(`👋 Bot added as admin to ${chatType} ${chatId}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )

  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper functions
async function sendTelegramMessage(token: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  console.log('Sending telegram message:', { chatId, text });
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
  
  const result = await response.json();
  console.log('Telegram API response:', result);
  return result;
}

async function sendTelegramMessageWithMarkup(token: string, chatId: number, text: string, reply_markup: any) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  console.log('Sending telegram message with markup:', { chatId, text, reply_markup });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_markup: reply_markup,
      parse_mode: 'HTML'
    }),
  })
  
  const result = await response.json();
  console.log('Telegram API response:', result);
  return result;
}

async function deleteTelegramMessage(token: string, chatId: number, messageId: number) {
  const url = `https://api.telegram.org/bot${token}/deleteMessage`
  console.log('Deleting telegram message:', { chatId, messageId });
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
    }),
  })
  
  const result = await response.json();
  console.log('Telegram API response:', result);
  return result;
}
