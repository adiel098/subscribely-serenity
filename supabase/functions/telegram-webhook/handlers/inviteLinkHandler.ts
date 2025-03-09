
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { data: community } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single();

    if (!community?.telegram_chat_id) {
      throw new Error('Community chat ID not found');
    }

    const payload: any = {
      chat_id: community.telegram_chat_id,
      creates_join_request: true,
    };

    if (options.name) {
      payload.name = options.name;
    }

    if (options.expireHours) {
      payload.expire_date = Math.floor(Date.now() / 1000) + (options.expireHours * 3600);
    }

    if (options.memberLimit) {
      payload.member_limit = options.memberLimit;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!result.ok) {
      throw new Error(result.description);
    }

    // Save the link in the community
    if (result.result?.invite_link) {
      await supabase
        .from('communities')
        .update({ telegram_invite_link: result.result.invite_link })
        .eq('id', communityId);
    }

    return result.result;
  } catch (error) {
    console.error('[Invite] Error creating invite link:', error);
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
