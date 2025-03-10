
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { kickMemberService } from '../handlers/services/memberKickService.ts';
import { corsHeaders } from '../cors.ts';

/**
 * Service responsible for handling member removal operations
 */
export async function handleMemberRemoval(
  supabase: ReturnType<typeof createClient>,
  chatId: string, 
  userId: string, 
  botToken: string,
  communityId?: string
): Promise<Response> {
  try {
    console.log(`[MEMBER-REMOVAL] 👤 Removing user ${userId} from chat ${chatId}`);
    const success = await kickMemberService(
      supabase,
      chatId,
      userId,
      botToken
    );

    // Always invalidate invite links for this user when removing
    if (success) {
      try {
        // First get the community ID for logging if not provided
        let resolvedCommunityId = communityId;
        
        if (!resolvedCommunityId) {
          const { data: community } = await supabase
            .from('communities')
            .select('id')
            .eq('telegram_chat_id', chatId)
            .single();
            
          resolvedCommunityId = community?.id;
        }
        
        // Then invalidate invite links
        const { error: invalidateError } = await supabase
          .from('subscription_payments')
          .update({ invite_link: null })
          .eq('telegram_user_id', userId)
          .eq('community_id', resolvedCommunityId);
        
        if (invalidateError) {
          console.error('[MEMBER-REMOVAL] ❌ Error invalidating invite links:', invalidateError);
          // Continue despite error as the main operation succeeded
        } else {
          console.log(`[MEMBER-REMOVAL] 🔗 Successfully invalidated invite links for user ${userId}`);
        }
        
        // Update the member record to set subscription_status to "removed"
        const { error: memberUpdateError } = await supabase
          .from('telegram_chat_members')
          .update({
            subscription_status: "removed",
            is_active: false
          })
          .eq('telegram_user_id', userId)
          .eq('community_id', resolvedCommunityId);
          
        if (memberUpdateError) {
          console.error('[MEMBER-REMOVAL] ❌ Error updating member status:', memberUpdateError);
        } else {
          console.log(`[MEMBER-REMOVAL] ✅ Successfully set subscription_status to "removed" for user ${userId}`);
        }
        
        // Log the removal in the activity log
        await supabase
          .from('subscription_activity_logs')
          .insert({
            telegram_user_id: userId,
            community_id: resolvedCommunityId,
            activity_type: 'member_removed',
            details: 'User removed from channel by admin'
          })
          .then(({ error }) => {
            if (error) {
              console.error('[MEMBER-REMOVAL] ❌ Error logging removal activity:', error);
            } else {
              console.log('[MEMBER-REMOVAL] 📝 Removal logged to activity log');
            }
          });
      } catch (error) {
        console.error('[MEMBER-REMOVAL] ❌ Error in invite link invalidation process:', error);
        // Continue despite error as the main operation succeeded
      }
    }

    console.log(`[MEMBER-REMOVAL] ${success ? '✅' : '❌'} Member removal ${success ? 'successful' : 'failed'}`);
    return new Response(JSON.stringify({ success }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[MEMBER-REMOVAL] ❌ Error removing member:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unknown error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
