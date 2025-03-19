
import { getLogger } from './services/loggerService.ts';

const logger = getLogger('webhook-manager');

export async function setupWebhook(botToken: string, webhookUrl: string) {
  try {
    logger.info('Setting up webhook...');
    logger.info(`Using webhook URL: ${webhookUrl}`);
    
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
    logger.info(`Webhook setup result: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    logger.error(`Error in setupWebhook: ${error.message}`, error);
    throw error;
  }
}

export async function getWebhookInfo(botToken: string) {
  try {
    logger.info('Getting webhook info...');
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`,
      { method: 'GET' }
    );
    const result = await response.json();
    logger.info(`Webhook info result: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    logger.error(`Error in getWebhookInfo: ${error.message}`, error);
    throw error;
  }
}
