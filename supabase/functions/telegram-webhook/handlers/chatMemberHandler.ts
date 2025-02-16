
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ChatMemberUpdate } from '../types.ts';
import { logTelegramEvent } from '../eventLogger.ts';
import { sendTelegramMessage } from '../telegramClient.ts';
import { handleSubscription } from '../subscriptionHandler.ts';
import { findOrCreateMember, deactivateMember } from '../memberHandler.ts';
import { getBotSettings, getGlobalSettings } from '../botSettingsHandler.ts';
import { findCommunityByTelegramId } from '../communityHandler.ts';

export async function getBotChatMember(botToken: string, chatId: string | number, userId: string | number) {
  try {
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
    console.log('Chat action response for user', userId, ':', data);
    
    if (!data.ok) {
      console.log('User', userId, 'cannot receive messages. Error:', data.description);
    }
    
    return data.ok;
  } catch (error) {
    console.error('Error checking member activity for user', userId, ':', error);
    return false;
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
