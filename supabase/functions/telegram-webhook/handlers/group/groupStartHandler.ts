import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { createGroupInviteLink } from '../inviteLinkHandler.ts';

/**
 * Handle the start command for group invites
 */
export async function handleGroupStartCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string,
  groupId: string
): Promise<boolean> {
  try {
    console.log(`👥👥👥 [START-COMMAND] Processing GROUP start command for group ID: ${groupId}`);
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    const group = await findGroupById(supabase, groupId);
    if (!group.success) {
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, the group you're trying to join doesn't exist or there was an error.`
      );
      return true;
    }

    const { hasActivePlan, hasActivePaymentMethod } = await checkGroupRequirements(supabase, groupId);
    
    if (!hasActivePlan || !hasActivePaymentMethod) {
      console.log(`⚠️ [START-COMMAND] Group ${groupId} does not meet requirements: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `⚠️ This group is not fully configured yet. Please contact the administrator.`
      );
      return true;
    }

    const groupCommunities = await findGroupCommunities(supabase, groupId);
    if (!groupCommunities.success) return false;

    if (groupCommunities.communityIds.length === 0) {
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, this group is not properly configured. Please contact the administrator.`
      );
      return true;
    }

    return await handleJoinRequest(supabase, message, botToken, group.data, userId);
  } catch (error) {
    console.error("❌ [START-COMMAND] Error in handleGroupStartCommand:", error);
    return false;
  }
}

/**
 * Check if a group has at least one active subscription plan and one active payment method
 */
async function checkGroupRequirements(
  supabase: ReturnType<typeof createClient>,
  groupId: string
): Promise<{ hasActivePlan: boolean, hasActivePaymentMethod: boolean }> {
  console.log(`🔍 [START-COMMAND] Checking group requirements for group ${groupId}`);
  
  const { data: groupMembers } = await supabase
    .from('community_group_members')
    .select('community_id')
    .eq('group_id', groupId);
  
  if (!groupMembers || groupMembers.length === 0) {
    console.log(`⚠️ [START-COMMAND] No communities found for group ${groupId}`);
    return { hasActivePlan: false, hasActivePaymentMethod: false };
  }
  
  const communityIds = groupMembers.map(member => member.community_id);
  
  const { count: planCount } = await supabase
    .from('subscription_plans')
    .select('id', { count: 'exact', head: true })
    .in('community_id', communityIds)
    .eq('is_active', true)
    .limit(1);
    
  const { count: paymentMethodCount } = await supabase
    .from('payment_methods')
    .select('id', { count: 'exact', head: true })
    .in('community_id', communityIds)
    .eq('is_active', true)
    .limit(1);
  
  const hasActivePlan = (planCount || 0) > 0;
  const hasActivePaymentMethod = (paymentMethodCount || 0) > 0;
  
  console.log(`✅ [START-COMMAND] Group ${groupId} requirements check: Active Plans: ${hasActivePlan ? 'YES' : 'NO'}, Active Payment Methods: ${hasActivePaymentMethod ? 'YES' : 'NO'}`);
  
  return { hasActivePlan, hasActivePaymentMethod };
}

/**
 * Find a group by its ID
 */
async function findGroupById(supabase: ReturnType<typeof createClient>, groupId: string) {
  const { data: group, error: groupError } = await supabase
    .from('community_groups')
    .select(`
      id,
      name,
      telegram_chat_id,
      telegram_invite_link
    `)
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    console.error(`❌ [START-COMMAND] Group not found: ${groupError?.message || 'Unknown error'}`);
    return { success: false, error: groupError };
  }

  console.log(`✅ [START-COMMAND] Found group: ${group.name}`);
  return { success: true, data: group };
}

/**
 * Find all communities associated with a group
 */
async function findGroupCommunities(supabase: ReturnType<typeof createClient>, groupId: string) {
  const { data: groupMembers, error: membersError } = await supabase
    .from('community_group_members')
    .select(`
      community_id,
      communities:community_id (
        id,
        name
      )
    `)
    .eq('group_id', groupId);

  if (membersError) {
    console.error(`❌ [START-COMMAND] Error fetching group members: ${membersError.message}`);
    return { success: false, error: membersError };
  }

  const communityIds = groupMembers?.map(member => member.community_id) || [];
  const communityNames = groupMembers
    ?.map(member => member.communities?.name)
    .filter(Boolean)
    .join(', ');

  return { 
    success: true, 
    communityIds,
    communityNames
  };
}

/**
 * Handle join request for any user regardless of subscription status
 */
async function handleJoinRequest(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  group: any,
  userId: string
): Promise<boolean> {
  console.log(`👋 [START-COMMAND] Processing join request for user ${userId} to group ${group.name}`);
  
  try {
    const inviteLinkResult = await createGroupInviteLink(supabase, group.id, botToken, {
      name: `User ${userId} - ${new Date().toISOString().split('T')[0]}`,
      expireHours: 24
    });
    
    if (inviteLinkResult?.invite_link) {
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `✅ Thanks for your interest in ${group.name}!\n\n` +
        `Here's your invite link to join the group:\n${inviteLinkResult.invite_link}\n\n` +
        `This link will expire in 24 hours and is for your use only. Please don't share it with others.`
      );
      return true;
    }
  } catch (linkError) {
    console.error("❌ [START-COMMAND] Error creating GROUP invite link:", linkError);
  }
  
  await sendTelegramMessage(
    botToken,
    message.chat.id,
    `✅ Thanks for your interest in ${group.name}!\n\n` +
    `However, there was an issue creating your invite link. Please contact support for assistance.`
  );
  
  return true;
}
