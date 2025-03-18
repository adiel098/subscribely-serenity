
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

// Process base64 image data to ensure it's properly formatted
function processImageData(imageData: string | null): string | null {
  if (!imageData) return null;
  
  console.log(`🖼️ [BROADCAST-HANDLER] Processing image data`);
  
  // Return the image as is if it's already a URL
  if (imageData.startsWith('http')) {
    console.log(`🖼️ [BROADCAST-HANDLER] Image is already a URL, no processing needed`);
    return imageData;
  }
  
  // For base64 data URLs, ensure they're properly formatted
  if (imageData.startsWith('data:image')) {
    // The image data is already correctly formatted for our telegramMessenger utility
    console.log(`🖼️ [BROADCAST-HANDLER] Image is a data URL, properly formatted`);
    return imageData;
  }
  
  console.log(`⚠️ [BROADCAST-HANDLER] Unrecognized image format, returning null`);
  return null;
}

// Get the bot username by querying Telegram API
async function getBotUsernameFromToken(botToken: string): Promise<string> {
  try {
    console.log(`🔍 [BROADCAST-HANDLER] Fetching bot username from API`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    
    if (data.ok && data.result && data.result.username) {
      const username = data.result.username;
      console.log(`✅ [BROADCAST-HANDLER] Got bot username from API: ${username}`);
      return username;
    }
    
    console.error(`❌ [BROADCAST-HANDLER] Failed to get bot username from API:`, data);
    return 'membifybot'; // Fallback to default
  } catch (error) {
    console.error(`❌ [BROADCAST-HANDLER] Error fetching bot username from API:`, error);
    return 'membifybot'; // Fallback to default
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

    // Process the image data if present
    const processedImage = processImageData(image);
    console.log(`📝 [BROADCAST-HANDLER] Image processed: ${!!processedImage}`);

    if (filterType === 'plan' && !subscriptionPlanId) {
      console.error(`❌ [BROADCAST-HANDLER] Plan filter specified but no subscriptionPlanId provided`);
      throw new Error('Subscription plan ID is required for plan filter type');
    }

    // Get bot token
    console.log(`🔍 [BROADCAST-HANDLER] Fetching bot token`);
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token, bot_username')
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
    
    // Get the bot's username either from settings or from the Telegram API
    let botUsername = settings.bot_username;
    if (!botUsername) {
      botUsername = await getBotUsernameFromToken(settings.bot_token);
    }
    console.log(`📝 [BROADCAST-HANDLER] Using bot username: ${botUsername}`);
    
    // Get entity details based on type (community or group)
    console.log(`🔍 [BROADCAST-HANDLER] Fetching entity details for ${entityId} (type: ${entityType})`);
    
    let entityName = '';
    let customLink = '';
    
    if (entityType === 'community') {
      // Get community details
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('name, custom_link')
        .eq('id', entityId)
        .single();
        
      if (communityError) {
        console.error(`❌ [BROADCAST-HANDLER] Error fetching community details:`, communityError);
        throw new Error(`Failed to get community details: ${communityError.message}`);
      }
      
      if (!community) {
        console.error(`❌ [BROADCAST-HANDLER] Community not found: ${entityId}`);
        throw new Error(`Community not found with ID: ${entityId}`);
      }
      
      entityName = community.name || 'Unknown Community';
      customLink = community.custom_link || '';
    } else {
      // Get group details
      const { data: group, error: groupError } = await supabase
        .from('community_groups')
        .select('name, custom_link')
        .eq('id', entityId)
        .single();
        
      if (groupError) {
        console.error(`❌ [BROADCAST-HANDLER] Error fetching group details:`, groupError);
        throw new Error(`Failed to get group details: ${groupError.message}`);
      }
      
      if (!group) {
        console.error(`❌ [BROADCAST-HANDLER] Group not found: ${entityId}`);
        throw new Error(`Group not found with ID: ${entityId}`);
      }
      
      entityName = group.name || 'Unknown Group';
      customLink = group.custom_link || '';
    }

    console.log(`✅ [BROADCAST-HANDLER] Successfully retrieved entity details: ${entityName}`);

    // Generate the proper mini app URL for Telegram - using t.me format with bot username
    const baseUrl = `https://t.me/${botUsername}?start=`;
    // Use either custom link or entity ID (without the prefix for groups)
    const linkParameter = customLink || (entityType === 'group' ? entityId.replace('group_', '') : entityId);
    const miniappUrl = `${baseUrl}${linkParameter}`;
    
    console.log(`📝 [BROADCAST-HANDLER] Generated MiniApp URL: ${miniappUrl}`);

    // Query subscribers
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
    let inlineKeyboard = null;
    if (includeButton) {
      // Validate the URL to ensure it's a proper HTTPS URL
      if (miniappUrl && miniappUrl.startsWith('https://')) {
        inlineKeyboard = {
          inline_keyboard: [[
            {
              text: "Join Community🚀",
              url: miniappUrl // Use URL property instead of web_app for external links
            }
          ]]
        };
        console.log(`📝 [BROADCAST-HANDLER] Created inline keyboard with URL: ${miniappUrl}`);
      } else {
        console.warn(`⚠️ [BROADCAST-HANDLER] Invalid URL for inline keyboard (not HTTPS): ${miniappUrl}`);
        console.warn(`⚠️ [BROADCAST-HANDLER] Button will be omitted from messages`);
      }
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
        console.log(`📤 [BROADCAST-HANDLER] Sending ${processedImage ? 'image+text' : 'text'} message to ${subscriber.telegram_user_id}`);
        
        const result = await sendTelegramMessage(
          settings.bot_token,
          subscriber.telegram_user_id,
          sanitizedMessage,
          inlineKeyboard,
          processedImage
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
