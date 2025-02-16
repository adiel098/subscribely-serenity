
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBotChatMember } from './membershipHandler.ts';

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
  subscriptionPlanId?: string
): Promise<BroadcastStatus> {
  try {
    console.log('Starting broadcast for community:', communityId);
    console.log('Filter type:', filterType);

    // Get bot token
    const { data: settings } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (!settings?.bot_token) {
      throw new Error('Bot token not found');
    }

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

    if (membersError) throw membersError;

    console.log(`Found ${members.length} potential recipients`);

    let successCount = 0;
    let failureCount = 0;

    // Send message to each member
    for (const member of members) {
      try {
        // Check if user can receive messages
        const canReceiveMessages = await getBotChatMember(
          settings.bot_token,
          member.telegram_user_id,
          member.telegram_user_id
        );

        if (!canReceiveMessages) {
          console.log(`Skipping user ${member.telegram_user_id} - cannot receive messages`);
          failureCount++;
          continue;
        }

        // Send the message
        const response = await fetch(
          `https://api.telegram.org/bot${settings.bot_token}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chat_id: member.telegram_user_id,
              text: message,
              parse_mode: 'HTML'
            }),
          }
        );

        const result = await response.json();
        
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

    // Update broadcast message status
    await supabase
      .from('broadcast_messages')
      .update({
        status: 'completed',
        total_recipients: members.length,
        sent_success: successCount,
        sent_failed: failureCount,
        completed_at: new Date().toISOString()
      })
      .eq('community_id', communityId)
      .eq('status', 'pending');

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
