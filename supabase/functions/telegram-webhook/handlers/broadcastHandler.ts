
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotChatMember } from './membershipHandler.ts';
import { sendTelegramMessage } from '../utils/telegramMessenger.ts';

interface BroadcastStatus {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

export async function sendBroadcast(
  supabase: ReturnType<typeof createClient>,
  communityId: string | null,
  groupId: string | null,
  message: string,
  filterType: 'all' | 'active' | 'expired' | 'plan' = 'all',
  subscriptionPlanId?: string,
  includeButton: boolean = false,
  image: string | null = null
): Promise<BroadcastStatus> {
  try {
    if (!communityId && !groupId) {
      throw new Error('Either communityId or groupId must be provided');
    }
    
    // For simplicity, we'll work with a single entityId
    const entityId = communityId || groupId;
    console.log(`Starting broadcast for entity: ${entityId}`);
    console.log('Filter type:', filterType);
    console.log('Include button:', includeButton);
    console.log('Image included:', !!image);

    // Get bot token and entity details
    const [settingsResult, entityResult] = await Promise.all([
      supabase.from('telegram_global_settings').select('bot_token').single(),
      supabase.from('communities')
        .select('miniapp_url, custom_link')
        .eq('id', entityId)
        .single()
        .catch(() => {
          // If not found as a community, try as a group
          return supabase.from('community_groups')
            .select('id, custom_link')
            .eq('id', entityId)
            .single();
        })
    ]);

    if (settingsResult.error) {
      console.error('Error fetching bot token:', settingsResult.error);
      throw settingsResult.error;
    }

    if (entityResult.error) {
      console.error('Error fetching entity details:', entityResult.error);
      throw entityResult.error;
    }

    if (!settingsResult.data?.bot_token) {
      console.error('Bot token not found in settings');
      throw new Error('Bot token not found');
    }

    console.log('Successfully retrieved bot token and entity details');

    // Get the appropriate miniapp URL
    let miniappUrl = entityResult.data.miniapp_url || entityResult.data.custom_link || '';
    if (!miniappUrl) {
      miniappUrl = `https://t.me/SubscribelyBot/webapp?startapp=${entityId}`;
    }

    // Query subscribers directly using the entity ID
    let query = supabase
      .from('community_subscribers')
      .select('telegram_user_id, subscription_status')
      .eq('community_id', entityId);

    // Apply filter by subscription status
    switch (filterType) {
      case 'active':
        query = query.eq('subscription_status', 'active');
        break;
      case 'expired':
        query = query.eq('subscription_status', 'expired');
        break;
      case 'plan':
        if (!subscriptionPlanId) {
          throw new Error('Subscription plan ID is required for plan filter type');
        }
        query = query.eq('subscription_plan_id', subscriptionPlanId);
        break;
    }

    const { data: subscribers, error: subscribersError } = await query;

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw subscribersError;
    }

    console.log(`Found ${subscribers?.length || 0} potential recipients`);

    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found matching the criteria');
      return {
        successCount: 0,
        failureCount: 0,
        totalRecipients: 0
      };
    }

    let successCount = 0;
    let failureCount = 0;

    // Prepare inline keyboard if button is requested
    const inlineKeyboard = includeButton ? {
      inline_keyboard: [[
        {
          text: "Join Community🚀",
          web_app: {
            url: miniappUrl
          }
        }
      ]]
    } : undefined;

    // Send message to each subscriber
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      try {
        console.log(`Attempting to send message to user ${subscriber.telegram_user_id}`);
        
        // Check if user can receive messages
        const canReceiveMessages = await getBotChatMember(
          settingsResult.data.bot_token,
          subscriber.telegram_user_id,
          subscriber.telegram_user_id
        );

        if (!canReceiveMessages) {
          console.log(`User ${subscriber.telegram_user_id} cannot receive messages - skipping`);
          failureCount++;
          continue;
        }

        // Ensure the message content is valid
        if (!message || typeof message !== 'string') {
          console.error(`Invalid message format for user ${subscriber.telegram_user_id}`);
          failureCount++;
          continue;
        }

        // Sanitize message to prevent HTML parsing issues
        const sanitizedMessage = message
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        // Send the message using our telegram messenger
        const result = await sendTelegramMessage(
          settingsResult.data.bot_token,
          subscriber.telegram_user_id,
          sanitizedMessage,
          inlineKeyboard,
          image
        );
        
        if (result.ok) {
          successCount++;
          console.log(`✅ Message sent successfully to user ${subscriber.telegram_user_id}`);
        } else {
          failureCount++;
          console.log(`❌ Failed to send message to user ${subscriber.telegram_user_id}:`, result.description);
        }

        // Add small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Error sending message to user ${subscriber.telegram_user_id}:`, error);
        failureCount++;
      }
    }

    const status: BroadcastStatus = {
      successCount,
      failureCount,
      totalRecipients: subscribers.length
    };

    console.log('Broadcast completed:', status);
    return status;
  } catch (error) {
    console.error('Error in broadcast:', error);
    throw error;
  }
}
