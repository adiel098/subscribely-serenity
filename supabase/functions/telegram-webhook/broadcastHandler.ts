
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
  subscriptionPlanId?: string
): Promise<BroadcastStatus> {
  try {
    console.log('Starting broadcast for community:', communityId);
    console.log('Filter type:', filterType);

    // Get bot token
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError) {
      console.error('Error fetching bot token:', settingsError);
      throw settingsError;
    }

    if (!settings?.bot_token) {
      console.error('Bot token not found in settings');
      throw new Error('Bot token not found');
    }

    console.log('Successfully retrieved bot token');

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
    const BATCH_SIZE = 5; // Update stats every 5 messages

    // Create initial broadcast record
    const { data: broadcastRecord, error: createError } = await supabase
      .from('broadcast_messages')
      .insert({
        community_id: communityId,
        message: message,
        filter_type: filterType,
        subscription_plan_id: subscriptionPlanId,
        status: 'pending',
        total_recipients: members.length,
        sent_success: 0,
        sent_failed: 0
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating broadcast record:', createError);
      throw createError;
    }

    // Function to update broadcast stats
    const updateBroadcastStats = async () => {
      const { error: updateError } = await supabase
        .from('broadcast_messages')
        .update({
          sent_success: successCount,
          sent_failed: failureCount
        })
        .eq('id', broadcastRecord.id);

      if (updateError) {
        console.error('Error updating broadcast stats:', updateError);
      }
    };

    // Send message to each member
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      try {
        console.log(`Attempting to send message to user ${member.telegram_user_id}`);
        
        // Check if user can receive messages
        const canReceiveMessages = await getBotChatMember(
          settings.bot_token,
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
          settings.bot_token,
          member.telegram_user_id,
          message
        );
        
        if (result.ok) {
          successCount++;
          console.log(`✅ Message sent successfully to user ${member.telegram_user_id}`);
        } else {
          failureCount++;
          console.log(`❌ Failed to send message to user ${member.telegram_user_id}:`, result.description);
        }

        // Update stats every BATCH_SIZE messages or on the last message
        if ((i + 1) % BATCH_SIZE === 0 || i === members.length - 1) {
          await updateBroadcastStats();
        }

        // Add small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Error sending message to user ${member.telegram_user_id}:`, error);
        failureCount++;
        
        // Update stats every BATCH_SIZE messages or on the last message
        if ((i + 1) % BATCH_SIZE === 0 || i === members.length - 1) {
          await updateBroadcastStats();
        }
      }
    }

    // Update final broadcast message status
    const { error: updateError } = await supabase
      .from('broadcast_messages')
      .update({
        status: 'completed',
        sent_success: successCount,
        sent_failed: failureCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', broadcastRecord.id);

    if (updateError) {
      console.error('Error updating broadcast status:', updateError);
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
