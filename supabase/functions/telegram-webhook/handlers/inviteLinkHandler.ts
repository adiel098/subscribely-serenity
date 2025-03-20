
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

interface InviteLinkOptions {
  name?: string;
  expireHours?: number;
  memberLimit?: number;
  createsJoinRequest?: boolean;
}

/**
 * Creates an invite link for a Telegram community
 */
export async function createInviteLink(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  botToken: string,
  options: InviteLinkOptions = {}
) {
  try {
    console.log(`🔗 [INVITE-LINK] Creating invite link for community: ${communityId}`);

    // Get the community's Telegram chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single();

    if (communityError || !community || !community.telegram_chat_id) {
      console.error(`❌ [INVITE-LINK] Error fetching community or no chat ID: ${communityError?.message || 'No chat ID'}`);
      return null;
    }

    console.log(`✅ [INVITE-LINK] Found chat ID: ${community.telegram_chat_id} for community ${communityId}`);

    // Create the invite link via Telegram API
    const createInviteLinkUrl = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;
    
    const params: Record<string, any> = {
      chat_id: community.telegram_chat_id,
    };

    if (options.name) {
      params.name = options.name;
    }

    if (options.expireHours) {
      const expireDate = Math.floor(Date.now() / 1000) + (options.expireHours * 3600);
      params.expire_date = expireDate;
    }

    if (options.memberLimit) {
      params.member_limit = options.memberLimit;
    }

    if (options.createsJoinRequest !== undefined) {
      params.creates_join_request = options.createsJoinRequest;
    }

    console.log(`🔗 [INVITE-LINK] Creating link with params:`, params);

    const response = await fetch(createInviteLinkUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const result = await response.json();

    if (!result.ok) {
      console.error(`❌ [INVITE-LINK] Telegram API error:`, result);
      return null;
    }

    console.log(`✅ [INVITE-LINK] Successfully created invite link:`, result.result.invite_link);
    
    // Update the community with the new invite link
    await supabase
      .from('communities')
      .update({ telegram_invite_link: result.result.invite_link })
      .eq('id', communityId);
      
    return result.result;

  } catch (error) {
    console.error(`❌ [INVITE-LINK] Error creating invite link:`, error);
    return null;
  }
}

/**
 * Creates an invite link for a Telegram group (from community_groups)
 */
export async function createGroupInviteLink(
  supabase: ReturnType<typeof createClient>,
  groupId: string,
  botToken: string,
  options: InviteLinkOptions = {}
) {
  try {
    console.log(`🔗 [GROUP-INVITE-LINK] Creating invite link for group: ${groupId}`);

    // Get the group's Telegram chat ID
    const { data: group, error: groupError } = await supabase
      .from('community_groups')
      .select('telegram_chat_id')
      .eq('id', groupId)
      .single();

    if (groupError || !group || !group.telegram_chat_id) {
      // Try looking in communities table instead
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', groupId)
        .single();
        
      if (communityError || !community || !community.telegram_chat_id) {
        console.error(`❌ [GROUP-INVITE-LINK] Error fetching group chat ID: ${groupError?.message || communityError?.message || 'No chat ID'}`);
        return null;
      }
      
      // Use the community chat ID
      group = community;
    }

    console.log(`✅ [GROUP-INVITE-LINK] Found chat ID: ${group.telegram_chat_id} for group ${groupId}`);

    // Create the invite link via Telegram API
    const createInviteLinkUrl = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;
    
    const params: Record<string, any> = {
      chat_id: group.telegram_chat_id,
    };

    if (options.name) {
      params.name = options.name;
    }

    if (options.expireHours) {
      const expireDate = Math.floor(Date.now() / 1000) + (options.expireHours * 3600);
      params.expire_date = expireDate;
    }

    if (options.memberLimit) {
      params.member_limit = options.memberLimit;
    }

    if (options.createsJoinRequest !== undefined) {
      params.creates_join_request = options.createsJoinRequest;
    }

    console.log(`🔗 [GROUP-INVITE-LINK] Creating link with params:`, params);

    const response = await fetch(createInviteLinkUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const result = await response.json();

    if (!result.ok) {
      console.error(`❌ [GROUP-INVITE-LINK] Telegram API error:`, result);
      return null;
    }

    console.log(`✅ [GROUP-INVITE-LINK] Successfully created invite link:`, result.result.invite_link);
    
    // Update the community's invite link in the database
    const updateResult = await supabase
      .from('communities')
      .update({ telegram_invite_link: result.result.invite_link })
      .eq('id', groupId);
      
    console.log(`🔄 Updated invite link in database:`, updateResult);
      
    return result.result;

  } catch (error) {
    console.error(`❌ [GROUP-INVITE-LINK] Error creating invite link:`, error);
    return null;
  }
}
