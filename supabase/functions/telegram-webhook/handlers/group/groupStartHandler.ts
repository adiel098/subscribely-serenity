
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

    const activeMembership = await checkActiveMembership(supabase, userId, groupCommunities.communityIds);
    
    if (activeMembership) {
      return await handleActiveUser(supabase, message, botToken, group.data, userId);
    } else {
      return await handleInactiveUser(message, botToken, group.data, groupCommunities.communityNames);
    }
  } catch (error) {
    console.error("❌ [START-COMMAND] Error in handleGroupStartCommand:", error);
    return false;
  }
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
 * Check if user has an active membership in any of the communities
 */
async function checkActiveMembership(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  communityIds: string[]
) {
  const { data: memberships, error: membershipError } = await supabase
    .from('telegram_chat_members')
    .select('id, subscription_status, subscription_end_date, community_id')
    .in('community_id', communityIds)
    .eq('telegram_user_id', userId);
    
  if (membershipError) {
    console.error(`❌ [START-COMMAND] Error checking membership: ${membershipError.message}`);
  }
  
  return memberships?.find(m => 
    m.subscription_status === 'active' && 
    (!m.subscription_end_date || new Date(m.subscription_end_date) > new Date())
  );
}

/**
 * Handle user with active membership
 */
async function handleActiveUser(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  group: any,
  userId: string
): Promise<boolean> {
  console.log(`💰 [START-COMMAND] Found active membership for user ${userId}`);
  
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

/**
 * Handle user without active membership
 */
async function handleInactiveUser(
  message: any,
  botToken: string,
  group: any,
  communityNames: string
): Promise<boolean> {
  console.log(`❌ [START-COMMAND] No active membership found for this user`);
  
  await sendTelegramMessage(
    botToken,
    message.chat.id,
    `👋 Welcome! To join ${group.name}, you need an active subscription to at least one of these communities: ${communityNames}.\n\n` +
    `Please visit our subscription page to get access.`
  );
  
  return true;
}
