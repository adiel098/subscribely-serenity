import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCommandMessage } from './commandHandler.ts';
import { createLogger } from '../services/loggingService.ts';

/**
 * Process a new message from Telegram
 */
export async function handleNewMessage(
  supabase: ReturnType<typeof createClient>,
  update: any,
  context: { BOT_TOKEN: string }
) {
  const logger = createLogger(supabase, 'MESSAGE-HANDLER');
  const message = update.message;
  
  await logger.info("🗨️ Processing new message:");
  await logger.info("Details:", message);
  
  try {
    // Check if it's a command message (starts with '/')
    if (message.text && message.text.startsWith('/')) {
      await logger.info("📨 Detected command, forwarding to command handler");
      const result = await handleCommandMessage(supabase, message, context.BOT_TOKEN);
      if (!result.success) {
        await logger.error("Command failed:", result.error);
      }
      return { success: true };
    }
    
    // Check if this is a private message to the bot
    if (message.chat.type === 'private') {
      await logger.info("📨 Received private message to bot");
      
      // Check if it looks like a verification code
      if (message.text && message.text.startsWith('MBF_')) {
        await logger.info("Detected verification code in private chat");
        
        const helpMessage = `❌ Error: Verification code must be sent in your channel

Please follow these steps:
1️⃣ Add me as an admin to your channel
2️⃣ Send the verification code *in your channel* (not here)
3️⃣ Click 'Verify Connection' in the Subscribely dashboard

Need help? Visit our website or contact support.`;

        await fetch(`https://api.telegram.org/bot${context.BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: message.chat.id,
            text: helpMessage,
            parse_mode: 'Markdown'
          })
        });
        
        return { success: true };
      }
      
      // Send a general helpful message for other private messages
      const helpMessage = `👋 Hi! I'm the Subscribely Bot.

I help manage paid Telegram channels and groups. Here's how to use me:

1️⃣ Add me as an admin to your channel
2️⃣ Get your verification code from the Subscribely dashboard
3️⃣ Send the verification code *in your channel* (not here)

❗ Important: Don't send the verification code here in private chat. It must be sent in the channel you want to connect.

Need help? Visit our website or contact support.`;

      await fetch(`https://api.telegram.org/bot${context.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: helpMessage,
          parse_mode: 'Markdown'
        })
      });
      
      return { success: true };
    }
    
    // Handle regular messages here if needed
    await logger.info(`📨 Received regular message from user ${message.from.id}`);
    
    await logger.info("Message handled");
    return { success: true };
  } catch (error) {
    await logger.error("Error handling message:", error);
    // Don't throw the error, just return failure
    return { success: false, error: error.message };
  }
}

/**
 * Process an edited message from Telegram
 */
export async function handleEditedMessage(
  supabase: ReturnType<typeof createClient>,
  update: any
) {
  const logger = createLogger(supabase, 'EDITED-MESSAGE-HANDLER');
  const message = update.edited_message;
  
  try {
    await logger.info("🖊️ Processing edited message");
    await logger.info("Details:", message);
    return { success: true };
  } catch (error) {
    await logger.error("Error handling edited message:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Process a channel post
 */
export async function handleChannelPost(
  supabase: ReturnType<typeof createClient>,
  update: any
) {
  const logger = createLogger(supabase, 'CHANNEL-POST-HANDLER');
  const post = update.channel_post;
  
  try {
    await logger.info("📢 Processing channel post");
    await logger.info("Details:", post);
    return { success: true };
  } catch (error) {
    await logger.error("Error handling channel post:", error);
    return { success: false, error: error.message };
  }
}
