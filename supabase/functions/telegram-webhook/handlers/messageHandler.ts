import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logTelegramEvent } from '../eventLogger.ts';
import { handleStartCommand } from './commandHandler.ts';

export async function handleNewMessage(supabase: ReturnType<typeof createClient>, update: any, context: { BOT_TOKEN: string }) {
  try {
    console.log('🗨️ Processing new message:', JSON.stringify(update.message, null, 2));
    
    const message = update.message;
    if (message?.text?.startsWith('/start')) {
      console.log('📨 Detected /start command, forwarding to handler');
      await handleStartCommand(supabase, message, context.BOT_TOKEN);
      return;
    }
    
    await logTelegramEvent(supabase, 'new_message', update);
  } catch (error) {
    console.error('❌ Error in handleNewMessage:', error);
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
