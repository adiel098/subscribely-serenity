
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotChatMember } from './membershipHandler.ts';
import { sendTelegramMessage } from './telegramClient.ts';

interface BroadcastStatus {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

export async function sendBroadcastMessage(
  supabase: ReturnType<typeof createClient>, 
  communityId: string,
  message: string,
  filterType: 'all' | 'active' | 'expired' | 'plan' = 'all',
  subscriptionPlanId?: string,
  includeButton?: boolean
): Promise<BroadcastStatus> {
  try {
    console.log('Starting broadcast for community:', communityId);
    console.log('Filter type:', filterType);

    // Get bot token and community details
    const [settingsResult, communityResult] = await Promise.all([
      supabase.from('telegram_global_settings').select('bot_token').single(),
      supabase.from('communities').select('miniapp_url').eq('id', communityId).single()
    ]);

    if (settingsResult.error) {
      console.error('Error fetching bot token:', settingsResult.error);
      throw settingsResult.error;
    }

    if (communityResult.error) {
      console.error('Error fetching community:', communityResult.error);
      throw communityResult.error;
    }

    if (!settingsResult.data?.bot_token) {
      console.error('Bot token not found in settings');
      throw new Error('Bot token not found');
    }

    console.log('Successfully retrieved bot token and community details');

    // Get all members based on filter
    let query = supabase
      .from('telegram_chat_members')
      .select('telegram_user_id, subscription_status')
      .eq('community_id', communityId);

    switch (filterType) {
      case 'active':
        query = query.eq('subscription_status', true);
        break;
      case 'expired':
        query = query.eq('subscription_status', false);
        break;
      case 'plan':
        if (!subscriptionPlanId) {
          throw new Error('Subscription plan ID is required for plan filter type');
        }
        query = query.eq('subscription_plan_id', subscriptionPlanId);
        break;
    }

    const { data: members, error: membersError } = await query;

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw membersError;
    }

    console.log(`Found ${members?.length || 0} potential recipients`);

    if (!members || members.length === 0) {
      console.log('No members found matching the criteria');
      return {
        successCount: 0,
        failureCount: 0,
        totalRecipients: 0
      };
    }

    let successCount = 0;
    let failureCount = 0;
    const BATCH_SIZE = 20;

    // Prepare inline keyboard if button is requested
    const inlineKeyboard = includeButton && communityResult.data.miniapp_url ? {
      inline_keyboard: [[
        {
          text: "הצטרף לקהילה 🚀",
          web_app: {
            url: `${communityResult.data.miniapp_url}?start=${communityId}`
          }
        }
      ]]
    } : undefined;

    // Send message to each member
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      try {
        console.log(`Attempting to send message to user ${member.telegram_user_id}`);
        
        // Check if user can receive messages
        const canReceiveMessages = await getBotChatMember(
          settingsResult.data.bot_token,
          member.telegram_user_id,
          member.telegram_user_id
        );

        if (!canReceiveMessages) {
          console.log(`User ${member.telegram_user_id} cannot receive messages - skipping`);
          failureCount++;
          continue;
        }

        // Send the message using our telegram client
        const result = await sendTelegramMessage(
          settingsResult.data.bot_token,
          member.telegram_user_id,
          message,
          inlineKeyboard
        );
        
        if (result.ok) {
          successCount++;
          console.log(`✅ Message sent successfully to user ${member.telegram_user_id}`);
        } else {
          failureCount++;
          console.log(`❌ Failed to send message to user ${member.telegram_user_id}:`, result.description);
        }

        // Add small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Error sending message to user ${member.telegram_user_id}:`, error);
        failureCount++;
      }
    }

    const status: BroadcastStatus = {
      successCount,
      failureCount,
      totalRecipients: members.length
    };

    console.log('Broadcast completed:', status);
    return status;
  } catch (error) {
    console.error('Error in broadcast:', error);
    throw error;
  }
}
