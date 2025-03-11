
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { handleSubscription } from '../../subscriptionHandler.ts';
import { createOrUpdateMember } from '../../utils/dbLogger.ts';
import { updateCommunityMemberCount } from '../../utils/communityCountUtils.ts';
import { createInviteLink } from '../inviteLinkHandler.ts';

/**
 * Handle start command for community invites
 */
export async function handleCommunityStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string,
  communityId: string
): Promise<boolean> {
  try {
    console.log(`🏢 [START-COMMAND] Processing community start command for community ID: ${communityId}`);
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    const community = await findCommunityById(supabase, communityId);
    if (!community.success) {
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`
      );
      return true;
    }
    
    const { data: subscriptionInfo } = await handleSubscription(supabase, communityId);
    
    if (subscriptionInfo) {
      return await handleActiveSubscriber(
        supabase,
        message,
        botToken,
        community.data,
        userId,
        username,
        subscriptionInfo
      );
    } else {
      return await handleInactiveSubscriber(message, botToken, community.data);
    }
  } catch (error) {
    console.error("❌ [START-COMMAND] Error in handleCommunityStartCommand:", error);
    return false;
  }
}

async function findCommunityById(supabase: ReturnType<typeof createClient>, communityId: string) {
  const { data: community, error: communityError } = await supabase
    .from('communities')
    .select('id, name, telegram_chat_id')
    .eq('id', communityId)
    .single();
  
  if (communityError || !community) {
    console.error(`❌ [START-COMMAND] Community not found: ${communityError?.message || 'Unknown error'}`);
    return { success: false, error: communityError };
  }
  
  return { success: true, data: community };
}

async function handleActiveSubscriber(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  community: any,
  userId: string,
  username: string | undefined,
  subscriptionInfo: any
): Promise<boolean> {
  // Create/update member record
  const memberData = {
    telegram_user_id: userId,
    telegram_username: username,
    community_id: community.id,
    is_active: true,
    subscription_status: 'active',
    subscription_plan_id: subscriptionInfo.subscriptionPlanId,
    subscription_start_date: subscriptionInfo.subscriptionStartDate.toISOString(),
    subscription_end_date: subscriptionInfo.subscriptionEndDate.toISOString()
  };
  
  const { success: memberSuccess } = await createOrUpdateMember(supabase, memberData);
  
  if (!memberSuccess) {
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      `❌ Sorry, there was an error processing your subscription.`
    );
    return true;
  }
  
  try {
    const inviteLinkResult = await createInviteLink(supabase, community.id, botToken, {
      name: `User ${userId} - ${new Date().toISOString().split('T')[0]}`,
      expireHours: 24
    });
    
    if (inviteLinkResult?.invite_link) {
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `✅ Thanks for subscribing to ${community.name}!\n\n` +
        `Here's your invite link to join the community:\n${inviteLinkResult.invite_link}\n\n` +
        `This link will expire in 24 hours and is for your use only. Please don't share it with others.`
      );
      
      await updateCommunityMemberCount(supabase, community.id);
      return true;
    }
  } catch (linkError) {
    console.error("❌ [START-COMMAND] Error creating invite link:", linkError);
  }
  
  await sendTelegramMessage(
    botToken,
    message.chat.id,
    `✅ Thanks for subscribing to ${community.name}!\n\n` +
    `However, there was an issue creating your invite link. Please contact the community owner for assistance.`
  );
  
  return true;
}

async function handleInactiveSubscriber(
  message: any,
  botToken: string,
  community: any
): Promise<boolean> {
  await sendTelegramMessage(
    botToken,
    message.chat.id,
    `👋 Welcome! To join ${community.name}, you need an active subscription.\n\n` +
    `Please visit our mini app to purchase a subscription.`
  );
  
  return true;
}
