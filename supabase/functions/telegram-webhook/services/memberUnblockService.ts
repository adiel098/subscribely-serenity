
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { unblockMemberService } from '../handlers/services/memberUnblockService.ts';
import { corsHeaders } from '../cors.ts';

/**
 * Service responsible for handling member unblock operations
 */
export async function handleMemberUnblock(
  supabase: ReturnType<typeof createClient>,
  chatId: string, 
  userId: string, 
  botToken: string
): Promise<Response> {
  try {
    console.log(`[MEMBER-UNBLOCK] 👤 Unblocking user ${userId} from chat ${chatId}`);
    const success = await unblockMemberService(
      supabase,
      chatId,
      userId,
      botToken
    );

    if (success) {
      try {
        // Get the community ID for logging
        const { data: community } = await supabase
          .from('communities')
          .select('id')
          .eq('telegram_chat_id', chatId)
          .single();
          
        const communityId = community?.id;
        
        // Log the unblock in the activity log
        await supabase
          .from('subscription_activity_logs')
          .insert({
            telegram_user_id: userId,
            community_id: communityId,
            activity_type: 'member_unblocked',
            details: 'User unblocked by admin'
          })
          .then(({ error }) => {
            if (error) {
              console.error('[MEMBER-UNBLOCK] ❌ Error logging unblock activity:', error);
            } else {
              console.log('[MEMBER-UNBLOCK] 📝 Unblock action logged to activity log');
            }
          });
      } catch (error) {
        console.error('[MEMBER-UNBLOCK] ❌ Error in activity logging process:', error);
        // Continue despite error as the main operation succeeded
      }
    }

    console.log(`[MEMBER-UNBLOCK] ${success ? '✅' : '❌'} Member unblock ${success ? 'successful' : 'failed'}`);
    return new Response(JSON.stringify({ success }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[MEMBER-UNBLOCK] ❌ Error unblocking member:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'An unknown error occurred' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
