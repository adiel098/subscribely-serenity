
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
  includeButton?: boolean
): Promise<BroadcastStatus> {
  try {
    if (!communityId && !groupId) {
      throw new Error('Either communityId or groupId must be provided');
    }
    
    console.log(`Starting broadcast for ${communityId ? 'community' : 'group'}: ${communityId || groupId}`);
    console.log('Filter type:', filterType);

    // Get bot token and entity details
    const [settingsResult, entityResult] = await Promise.all([
      supabase.from('telegram_global_settings').select('bot_token').single(),
      communityId 
        ? supabase.from('communities').select('miniapp_url').eq('id', communityId).single()
        : supabase.from('community_groups')
            .select('id, community_members(community_id, communities(miniapp_url))')
            .eq('id', groupId)
            .single()
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
    let miniappUrl = '';
    if (communityId && entityResult.data.miniapp_url) {
      miniappUrl = entityResult.data.miniapp_url;
    } else if (groupId && entityResult.data.community_members && 
               entityResult.data.community_members[0]?.communities?.miniapp_url) {
      miniappUrl = entityResult.data.community_members[0].communities.miniapp_url;
    }

    // Get all members based on filter
    let query = supabase
      .from('telegram_chat_members')
      .select('telegram_user_id, subscription_status');
      
    if (communityId) {
      query = query.eq('community_id', communityId);
    } else if (groupId) {
      // For groups, we need to join with community_group_members
      const { data: groupMembers, error: groupError } = await supabase
        .from('community_group_members')
        .select('telegram_user_id')
        .eq('group_id', groupId);
        
      if (groupError) {
        console.error('Error fetching group members:', groupError);
        throw groupError;
      }
      
      if (!groupMembers || groupMembers.length === 0) {
        console.log('No members found for this group');
        return {
          successCount: 0,
          failureCount: 0,
          totalRecipients: 0
        };
      }
      
      const telegramUserIds = groupMembers.map(m => m.telegram_user_id);
      query = query.in('telegram_user_id', telegramUserIds);
    }

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

    // Prepare inline keyboard if button is requested
    const inlineKeyboard = includeButton && miniappUrl ? {
      inline_keyboard: [[
        {
          text: "Join Community🚀",
          web_app: {
            url: `${miniappUrl}?start=${communityId || groupId}`
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

        // Ensure the message content is valid
        if (!message || typeof message !== 'string') {
          console.error(`Invalid message format for user ${member.telegram_user_id}`);
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
          member.telegram_user_id,
          sanitizedMessage,
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
