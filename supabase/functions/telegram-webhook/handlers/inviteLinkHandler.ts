
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export async function createInviteLink(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  botToken: string,
  options: {
    name?: string;
    expireHours?: number;
    memberLimit?: number;
  } = {}
) {
  try {
    console.log(`[Invite] Creating invite link for community ID: ${communityId}`);
    
    const { data: community } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single();

    if (!community?.telegram_chat_id) {
      console.error(`[Invite] ❌ Error: Community chat ID not found for communityId: ${communityId}`);
      throw new Error('Community chat ID not found');
    }
    
    console.log(`[Invite] Found telegram_chat_id: ${community.telegram_chat_id} for community: ${communityId}`);

    const payload: any = {
      chat_id: community.telegram_chat_id,
      creates_join_request: true,
    };

    if (options.name) {
      payload.name = options.name;
    } else {
      // Generate a unique name if none provided
      payload.name = `Invite-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(2, 8)}`;
    }

    if (options.expireHours) {
      payload.expire_date = Math.floor(Date.now() / 1000) + (options.expireHours * 3600);
    }

    if (options.memberLimit) {
      payload.member_limit = options.memberLimit;
    }
    
    console.log(`[Invite] Creating invite link with payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    console.log(`[Invite] Telegram API response:`, JSON.stringify(result, null, 2));
    
    if (!result.ok) {
      console.error(`[Invite] ❌ Telegram API error: ${result.description}`);
      throw new Error(result.description);
    }

    // Save the link in the community
    if (result.result?.invite_link) {
      console.log(`[Invite] ✅ Successfully created invite link: ${result.result.invite_link}`);
      
      const { error: updateError } = await supabase
        .from('communities')
        .update({ telegram_invite_link: result.result.invite_link })
        .eq('id', communityId);
        
      if (updateError) {
        console.error(`[Invite] Warning: Failed to save invite link to database: ${updateError.message}`);
      }
    }

    return result.result;
  } catch (error) {
    console.error('[Invite] ❌ Error creating invite link:', error);
    throw error;
  }
}

/**
 * Create an invite link for a community group
 */
export async function createGroupInviteLink(
  supabase: ReturnType<typeof createClient>,
  groupId: string,
  botToken: string,
  options: {
    name?: string;
    expireHours?: number;
    memberLimit?: number;
  } = {}
) {
  try {
    console.log(`[Invite] 👥 Creating invite link for GROUP ID: ${groupId}`);
    
    const { data: group } = await supabase
      .from('community_groups')
      .select('telegram_chat_id')
      .eq('id', groupId)
      .single();

    if (!group?.telegram_chat_id) {
      console.error(`[Invite] ❌ Error: Group chat ID not found for groupId: ${groupId}`);
      throw new Error('Group chat ID not found');
    }
    
    console.log(`[Invite] 👥 Found telegram_chat_id: ${group.telegram_chat_id} for group: ${groupId}`);

    const payload: any = {
      chat_id: group.telegram_chat_id,
      creates_join_request: true,
    };

    if (options.name) {
      payload.name = options.name;
    } else {
      // Generate a unique name if none provided
      payload.name = `Group-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substring(2, 8)}`;
    }

    if (options.expireHours) {
      payload.expire_date = Math.floor(Date.now() / 1000) + (options.expireHours * 3600);
    }

    if (options.memberLimit) {
      payload.member_limit = options.memberLimit;
    }
    
    console.log(`[Invite] 👥 Creating GROUP invite link with payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    console.log(`[Invite] 👥 Telegram API response for GROUP:`, JSON.stringify(result, null, 2));
    
    if (!result.ok) {
      console.error(`[Invite] ❌ Telegram API error for GROUP: ${result.description}`);
      throw new Error(result.description);
    }

    // Save the link in the group
    if (result.result?.invite_link) {
      console.log(`[Invite] ✅ Successfully created GROUP invite link: ${result.result.invite_link}`);
      
      const { error: updateError } = await supabase
        .from('community_groups')
        .update({ telegram_invite_link: result.result.invite_link })
        .eq('id', groupId);
        
      if (updateError) {
        console.error(`[Invite] Warning: Failed to save GROUP invite link to database: ${updateError.message}`);
      }
    }

    return result.result;
  } catch (error) {
    console.error('[Invite] ❌ Error creating GROUP invite link:', error);
    throw error;
  }
}

// Function to invalidate an invite link
export async function invalidateInviteLink(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string,
  communityId: string
) {
  try {
    console.log(`[Invite] Invalidating invite links for user ${telegramUserId} in community ${communityId}`);
    
    const { data, error } = await supabase
      .from('subscription_payments')
      .update({ invite_link: null })
      .eq('telegram_user_id', telegramUserId)
      .eq('community_id', communityId);
      
    if (error) {
      console.error('[Invite] Error invalidating invite links:', error);
      throw error;
    }
    
    console.log('[Invite] Successfully invalidated invite links');
    return true;
  } catch (error) {
    console.error('[Invite] Error in invalidateInviteLink:', error);
    return false;
  }
}
