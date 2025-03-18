
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../utils/telegramMessenger.ts';

interface BroadcastStatus {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

// Helper function to check if the bot can message a user
async function getBotChatMember(
  botToken: string,
  userId: string | number,
  chatId: string | number
): Promise<boolean> {
  try {
    console.log(`🔍 [BROADCAST-HANDLER] Checking if bot can message user ${userId}`);
    
    const url = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: userId
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log(`✅ [BROADCAST-HANDLER] Bot can message user ${userId}`);
      return true;
    } else {
      console.log(`⚠️ [BROADCAST-HANDLER] Bot cannot message user ${userId}: ${data.description}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ [BROADCAST-HANDLER] Error checking if bot can message user:`, error);
    return false;
  }
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
    console.log(`🚀 [BROADCAST-HANDLER] Starting broadcast operation`);
    
    // Validate input parameters
    if (!communityId && !groupId) {
      console.error(`❌ [BROADCAST-HANDLER] No target entity specified`);
      throw new Error('Either communityId or groupId must be provided');
    }
    
    if (!message || typeof message !== 'string') {
      console.error(`❌ [BROADCAST-HANDLER] Invalid message content`);
      throw new Error('Valid message content is required');
    }
    
    // For simplicity, we'll work with a single entityId
    const entityId = communityId || groupId;
    const entityType = communityId ? 'community' : 'group';
    
    console.log(`📝 [BROADCAST-HANDLER] Target entity: ${entityId} (type: ${entityType})`);
    console.log(`📝 [BROADCAST-HANDLER] Filter type: ${filterType}`);
    console.log(`📝 [BROADCAST-HANDLER] Include button: ${includeButton}`);
    console.log(`📝 [BROADCAST-HANDLER] Image included: ${!!image}`);

    if (filterType === 'plan') {
      if (!subscriptionPlanId) {
        console.error(`❌ [BROADCAST-HANDLER] Plan filter specified but no subscriptionPlanId provided`);
        throw new Error('Subscription plan ID is required for plan filter type');
      }
      console.log(`📝 [BROADCAST-HANDLER] Using subscription plan: ${subscriptionPlanId}`);
    }

    // Get bot token
    console.log(`🔍 [BROADCAST-HANDLER] Fetching bot token`);
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError) {
      console.error(`❌ [BROADCAST-HANDLER] Error fetching bot token:`, settingsError);
      throw new Error(`Failed to get bot token: ${settingsError.message}`);
    }

    if (!settings?.bot_token) {
      console.error(`❌ [BROADCAST-HANDLER] Bot token not found in settings`);
      throw new Error('Bot token not found');
    }

    console.log(`✅ [BROADCAST-HANDLER] Successfully retrieved bot token`);
    
    // Get entity details
    console.log(`🔍 [BROADCAST-HANDLER] Fetching entity details for ${entityId}`);
    let entityResult;
    
    if (entityType === 'community') {
      const { data, error } = await supabase
        .from('communities')
        .select('miniapp_url, custom_link, name')
        .eq('id', entityId)
        .single();
        
      if (error) {
        console.error(`❌ [BROADCAST-HANDLER] Error fetching community details:`, error);
        throw new Error(`Failed to get community details: ${error.message}`);
      }
      
      entityResult = { data };
    } else {
      // Entity is a group
      const { data, error } = await supabase
        .from('community_groups')
        .select('id, custom_link, name')
        .eq('id', entityId)
        .single();
        
      if (error) {
        console.error(`❌ [BROADCAST-HANDLER] Error fetching group details:`, error);
        throw new Error(`Failed to get group details: ${error.message}`);
      }
      
      entityResult = { data };
    }

    if (!entityResult?.data) {
      console.error(`❌ [BROADCAST-HANDLER] Entity details not found for ${entityId}`);
      throw new Error(`Entity not found with ID: ${entityId}`);
    }

    console.log(`✅ [BROADCAST-HANDLER] Successfully retrieved entity details`);
    console.log(`📝 [BROADCAST-HANDLER] Entity name: ${entityResult.data.name || 'Unknown'}`);

    // Get the appropriate miniapp URL
    let miniappUrl = entityResult.data.miniapp_url || entityResult.data.custom_link || '';
    if (!miniappUrl) {
      miniappUrl = `https://t.me/SubscribelyBot/webapp?startapp=${entityId}`;
    }
    console.log(`📝 [BROADCAST-HANDLER] MiniApp URL: ${miniappUrl}`);

    // Query subscribers directly using the entity ID
    console.log(`🔍 [BROADCAST-HANDLER] Querying subscribers for entity: ${entityId}`);
    let query = supabase
      .from('community_subscribers')
      .select('telegram_user_id, subscription_status');
      
    // Apply entity filter
    if (entityType === 'community') {
      query = query.eq('community_id', entityId);
    } else {
      query = query.eq('group_id', entityId);
    }

    // Apply filter by subscription status
    switch (filterType) {
      case 'active':
        console.log(`📝 [BROADCAST-HANDLER] Filtering by active subscription status`);
        query = query.eq('subscription_status', 'active');
        break;
      case 'expired':
        console.log(`📝 [BROADCAST-HANDLER] Filtering by expired subscription status`);
        query = query.eq('subscription_status', 'expired');
        break;
      case 'plan':
        console.log(`📝 [BROADCAST-HANDLER] Filtering by subscription plan: ${subscriptionPlanId}`);
        query = query.eq('subscription_plan_id', subscriptionPlanId);
        break;
      default:
        console.log(`📝 [BROADCAST-HANDLER] No filters applied, targeting all subscribers`);
    }

    const { data: subscribers, error: subscribersError } = await query;

    if (subscribersError) {
      console.error(`❌ [BROADCAST-HANDLER] Error fetching subscribers:`, subscribersError);
      throw new Error(`Failed to fetch subscribers: ${subscribersError.message}`);
    }

    console.log(`📊 [BROADCAST-HANDLER] Found ${subscribers?.length || 0} potential recipients`);

    if (!subscribers || subscribers.length === 0) {
      console.log(`⚠️ [BROADCAST-HANDLER] No subscribers found matching the criteria`);
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

    console.log(`📝 [BROADCAST-HANDLER] Include button: ${!!inlineKeyboard}`);
    
    if (inlineKeyboard) {
      console.log(`📝 [BROADCAST-HANDLER] Button URL: ${miniappUrl}`);
    }

    // Send message to each subscriber
    console.log(`🔄 [BROADCAST-HANDLER] Beginning to send messages to ${subscribers.length} subscribers`);
    
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      try {
        console.log(`📤 [BROADCAST-HANDLER] Processing subscriber ${i+1}/${subscribers.length}: ${subscriber.telegram_user_id}`);
        
        // Check if user can receive messages
        console.log(`🔍 [BROADCAST-HANDLER] Checking if user ${subscriber.telegram_user_id} can receive messages`);
        const canReceiveMessages = await getBotChatMember(
          settings.bot_token,
          subscriber.telegram_user_id,
          subscriber.telegram_user_id
        );

        if (!canReceiveMessages) {
          console.log(`⚠️ [BROADCAST-HANDLER] User ${subscriber.telegram_user_id} cannot receive messages - skipping`);
          failureCount++;
          continue;
        }

        // Sanitize message to prevent HTML parsing issues
        const sanitizedMessage = message
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        // Send the message using our telegram messenger
        console.log(`📤 [BROADCAST-HANDLER] Sending ${image ? 'image+text' : 'text'} message to ${subscriber.telegram_user_id}`);
        
        const result = await sendTelegramMessage(
          settings.bot_token,
          subscriber.telegram_user_id,
          sanitizedMessage,
          inlineKeyboard,
          image
        );
        
        if (result.ok) {
          successCount++;
          console.log(`✅ [BROADCAST-HANDLER] Message sent successfully to user ${subscriber.telegram_user_id}`);
        } else {
          failureCount++;
          console.log(`❌ [BROADCAST-HANDLER] Failed to send message to user ${subscriber.telegram_user_id}: ${result.description}`);
        }

        // Add small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ [BROADCAST-HANDLER] Error sending message to user ${subscriber.telegram_user_id}:`, error);
        failureCount++;
      }
    }

    const status: BroadcastStatus = {
      successCount,
      failureCount,
      totalRecipients: subscribers.length
    };

    console.log(`🏁 [BROADCAST-HANDLER] Broadcast completed with results:`);
    console.log(`📊 [BROADCAST-HANDLER] Total recipients: ${status.totalRecipients}`);
    console.log(`📊 [BROADCAST-HANDLER] Success count: ${status.successCount}`);
    console.log(`📊 [BROADCAST-HANDLER] Failure count: ${status.failureCount}`);
    
    return status;
  } catch (error) {
    console.error(`❌ [BROADCAST-HANDLER] Error in broadcast operation:`, error);
    console.error(`❌ [BROADCAST-HANDLER] Stack trace:`, error.stack);
    throw error;
  }
}
