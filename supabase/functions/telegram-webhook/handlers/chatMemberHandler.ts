import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logMembershipChange } from './utils/logHelper.ts';
import { createOrUpdateMember } from './utils/dbLogger.ts';
import { updateCommunityMemberCount } from './services/communityCountService.ts';
import { 
  processNewMember, 
  processPaymentBasedMembership,
  processMemberLeft
} from './services/memberSubscriptionService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleChatMemberUpdate = async (supabase: ReturnType<typeof createClient>, update: any) => {
  console.log('[CHAT-MEMBER] 📥 Processing chat member update:', update);

  if (!update.chat?.id || !update.new_chat_member?.user?.id) {
    console.error('[CHAT-MEMBER] ❌ Missing required chat member data:', { update });
    return new Response(JSON.stringify({ error: 'Invalid chat member data' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });
  }

  try {
    // Get community ID from the chat ID
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', update.chat.id.toString())
      .single();

    if (communityError || !community) {
      console.error('[CHAT-MEMBER] ❌ Error finding community:', communityError);
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log(`[CHAT-MEMBER] ✅ Found community: ${community.id}`);

    const telegramUserId = update.new_chat_member.user.id.toString();
    const username = update.new_chat_member.user.username;
    const status = update.new_chat_member.status;

    // If user joins the chat
    if (['member', 'administrator', 'creator'].includes(status)) {
      await handleMemberJoined(supabase, update, telegramUserId, username, community.id, status);
    }
    // If user leaves chat
    else if (status === 'left' || status === 'kicked') {
      await handleMemberLeft(supabase, update, telegramUserId, username, community.id, status);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[CHAT-MEMBER] ❌ Error in chat member handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

/**
 * Handle when a member joins the chat
 */
async function handleMemberJoined(
  supabase: ReturnType<typeof createClient>,
  update: any,
  telegramUserId: string,
  username: string | undefined,
  communityId: string,
  status: string
) {
  console.log(`[CHAT-MEMBER] 👋 User joined chat: ${telegramUserId} with status: ${status}`);

  // Check if there's an existing member record
  const { data: existingMember, error: memberCheckError } = await supabase
    .from('telegram_chat_members')
    .select('id, subscription_status, subscription_plan_id, subscription_end_date')
    .eq('telegram_user_id', telegramUserId)
    .eq('community_id', communityId)
    .maybeSingle();
  
  console.log('[CHAT-MEMBER] 🔍 Existing member check:', { 
    found: !!existingMember, 
    data: existingMember, 
    error: memberCheckError 
  });
  
  // Handle member record creation or update
  if (!existingMember) {
    // No existing record, process as new member
    await processNewMember(supabase, telegramUserId, username, communityId);
  } else {
    // Update existing member record as active
    console.log('[CHAT-MEMBER] 🔄 Updating existing member record as active');
    await createOrUpdateMember(supabase, {
      telegram_user_id: telegramUserId,
      telegram_username: username,
      community_id: communityId,
      is_active: true,
      // Keep existing subscription data
      subscription_status: existingMember.subscription_status,
      subscription_plan_id: existingMember.subscription_plan_id,
      subscription_end_date: existingMember.subscription_end_date
    });
  }
  
  // Log the membership change
  await logMembershipChange(
    supabase,
    update.chat.id.toString(),
    telegramUserId,
    username,
    'added',
    `User added to group with status: ${status}`,
    update
  );
  
  // Update the community member count
  await updateCommunityMemberCount(supabase, communityId);
}

/**
 * Handle when a member leaves or is kicked from the chat
 */
async function handleMemberLeft(
  supabase: ReturnType<typeof createClient>,
  update: any,
  telegramUserId: string,
  username: string | undefined,
  communityId: string,
  status: string
) {
  console.log(`[CHAT-MEMBER] 👋 User left/kicked from chat: ${telegramUserId}`);

  // Update member record as inactive
  await processMemberLeft(supabase, telegramUserId, username, communityId);
  
  // Log the membership change
  await logMembershipChange(
    supabase,
    update.chat.id.toString(),
    telegramUserId,
    username,
    'removed',
    `User ${status} from group`,
    update
  );
  
  // Update the community member count
  await updateCommunityMemberCount(supabase, communityId);
}
