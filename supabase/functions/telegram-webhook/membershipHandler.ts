
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ChatMemberUpdate } from './types.ts';
import { logTelegramEvent } from './eventLogger.ts';
import { sendTelegramMessage } from './telegramClient.ts';
import { handleSubscription } from './subscriptionHandler.ts';
import { findOrCreateMember, deactivateMember } from './memberHandler.ts';
import { getBotSettings, getGlobalSettings } from './botSettingsHandler.ts';
import { findCommunityByTelegramId, findCommunityById } from './communityHandler.ts';

async function getBotChatMember(botToken: string, chatId: string | number, userId: string | number) {
  try {
    // First, try to send a status message to the user privately
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendChatAction`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userId,
          action: 'typing'
        }),
      }
    );

    const data = await response.json();
    console.log('Chat action response:', data);
    
    // If we can send them a chat action, it means they have an active interaction with the bot
    return data.ok;
  } catch (error) {
    console.error('Error checking member activity:', error);
    return false;
  }
}

export async function updateMemberActivity(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    console.log('Updating member activity for community:', communityId);

    // Get bot token
    const { data: settings } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (!settings?.bot_token) {
      throw new Error('Bot token not found');
    }

    // Get community telegram chat id
    const { data: community } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single();

    if (!community?.telegram_chat_id) {
      throw new Error('Community telegram chat id not found');
    }

    // Get all members
    const { data: members, error: membersError } = await supabase
      .from('telegram_chat_members')
      .select('telegram_user_id')
      .eq('community_id', communityId);

    if (membersError) throw membersError;

    console.log(`Found ${members.length} members to check`);

    // Check each member's status
    for (const member of members) {
      const canReceiveMessages = await getBotChatMember(
        settings.bot_token,
        community.telegram_chat_id,
        member.telegram_user_id
      );

      await supabase
        .from('telegram_chat_members')
        .update({
          is_active: canReceiveMessages,
          last_checked: new Date().toISOString()
        })
        .eq('telegram_user_id', member.telegram_user_id)
        .eq('community_id', communityId);

      // Add small delay to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log('✅ Successfully updated member activity');
  } catch (error) {
    console.error('Error updating member activity:', error);
    throw error;
  }
}

export async function handleChatMemberUpdate(supabase: ReturnType<typeof createClient>, update: { chat_member: ChatMemberUpdate }) {
  try {
    console.log('👥 Processing chat_member update:', JSON.stringify(update.chat_member, null, 2));
    
    const chatMember = update.chat_member;
    const { chat, from: member, new_chat_member, old_chat_member, invite_link } = chatMember;
    
    if (new_chat_member?.status === 'member' && old_chat_member?.status === 'left') {
      console.log('🎉 Member joined channel:', member.username);
      
      const community = await findCommunityByTelegramId(supabase, chat.id);
      console.log('Found community:', community);

      const [botSettings, globalSettings] = await Promise.all([
        getBotSettings(supabase, community.id),
        getGlobalSettings(supabase)
      ]);

      const subscription = await handleSubscription(supabase, invite_link?.invite_link);
      await findOrCreateMember(supabase, community.id, member.id.toString(), member.username || '', subscription);

      if (botSettings.auto_welcome_message && botSettings.welcome_message) {
        const welcomeMessage = `${botSettings.welcome_message}\n\n${botSettings.bot_signature || ''}`;
        await sendTelegramMessage(globalSettings.bot_token, chat.id, welcomeMessage);
      }
      
      console.log('✅ Successfully processed new member');
    } else if (new_chat_member?.status === 'left' && old_chat_member?.status === 'member') {
      console.log('👋 Member left channel:', member.username);
      
      const community = await findCommunityByTelegramId(supabase, chat.id);
      await deactivateMember(supabase, community.id, member.id.toString());
      
      console.log('✅ Successfully processed member departure');
    }
    
    await logTelegramEvent(supabase, 'chat_member', update);
  } catch (error) {
    console.error('Error in handleChatMemberUpdate:', error);
    throw error;
  }
}

export async function handleChatJoinRequest(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('👤 Processing chat join request:', JSON.stringify(update.chat_join_request, null, 2));
    await logTelegramEvent(supabase, 'chat_join_request', update);
  } catch (error) {
    console.error('Error in handleChatJoinRequest:', error);
    throw error;
  }
}

export async function handleNewMessage(supabase: ReturnType<typeof createClient>, update: any, context: { BOT_TOKEN: string }) {
  try {
    console.log('🗨️ Processing new message:', JSON.stringify(update.message, null, 2));
    
    const message = update.message;
    if (message?.text?.startsWith('/start')) {
      console.log('Processing /start command');
      const communityId = message.text.split(' ')[1];
      
      if (communityId) {
        const [community, botSettings] = await Promise.all([
          findCommunityById(supabase, communityId),
          getBotSettings(supabase, communityId)
        ]);

        console.log('Found community:', community);
        const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app`;

        // Send welcome message with bot signature
        const welcomeMessage = `ברוכים הבאים ל-${community.name}! 🎉\nלחצו על הכפתור למטה כדי להצטרף:\n\n${botSettings.bot_signature || ''}`;
        
        const response = await fetch(`https://api.telegram.org/bot${context.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: welcomeMessage,
            reply_markup: {
              inline_keyboard: [[
                {
                  text: "הצטרפות לקהילה 🚀",
                  web_app: {
                    url: `${miniAppUrl}?start=${communityId}`
                  }
                }
              ]]
            }
          })
        });

        const result = await response.json();
        console.log('Telegram API response:', result);
      }
    }
    
    await logTelegramEvent(supabase, 'new_message', update);
  } catch (error) {
    console.error('Error in handleNewMessage:', error);
    throw error;
  }
}

export async function handleEditedMessage(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('✏️ Processing edited message:', JSON.stringify(update.edited_message, null, 2));
    await logTelegramEvent(supabase, 'edited_message', update);
  } catch (error) {
    console.error('Error in handleEditedMessage:', error);
    throw error;
  }
}

export async function handleChannelPost(supabase: ReturnType<typeof createClient>, update: any) {
  try {
    console.log('📢 Processing channel post:', JSON.stringify(update.channel_post, null, 2));
    await logTelegramEvent(supabase, 'channel_post', update);
  } catch (error) {
    console.error('Error in handleChannelPost:', error);
    throw error;
  }
}

export async function handleMyChatMember(supabase: ReturnType<typeof createClient>, update: any) {
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
