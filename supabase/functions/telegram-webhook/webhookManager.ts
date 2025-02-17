
import { TelegramClient } from "./telegramClient.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export class WebhookManager {
  private update: any;
  private telegramClient: TelegramClient;
  private supabaseClient: ReturnType<typeof createClient>;

  constructor(
    update: any,
    telegramClient: TelegramClient,
    supabaseClient: ReturnType<typeof createClient>
  ) {
    this.update = update;
    this.telegramClient = telegramClient;
    this.supabaseClient = supabaseClient;
  }
}

export async function setupWebhook(botToken: string, webhookUrl: string) {
  try {
    console.log('Setting up webhook...'); 
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

export async function getWebhookInfo(botToken: string) {
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
