
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleChatJoinRequest } from '../handlers/services/joinRequestHandler.ts';
import { kickMemberService } from '../handlers/services/memberKickService.ts';
import { handleChatMemberUpdate } from '../handlers/memberUpdateHandler.ts';
import { handleMyChatMember } from '../handlers/botStatusHandler.ts';
import { handleStartCommand } from '../handlers/startCommandHandler.ts';
import { handleVerificationMessage } from '../handlers/verificationHandler.ts';
import { handleChannelVerification } from '../handlers/channelVerificationHandler.ts';
import { corsHeaders } from '../cors.ts';
import { updateMemberActivity } from '../handlers/utils/activityUtils.ts';

export async function routeTelegramWebhook(req: Request, supabaseClient: ReturnType<typeof createClient>, botToken: string) {
  console.log("[ROUTER] 🔄 Routing Telegram webhook request");
  
  try {
    let body;
    try {
      body = await req.json();
      console.log("[ROUTER] 📝 Request body parsed successfully");
      console.log("[ROUTER] 📦 Request body:", JSON.stringify(body, null, 2));
    } catch (error) {
      console.error("[ROUTER] ❌ Error parsing request body:", error);
      throw new Error('Invalid JSON in request body');
    }
    
    // Check if user is suspended before processing any requests
    if (body.message?.from?.id) {
      const telegramUserId = body.message.from.id.toString();
      
      // Check user suspension status
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('is_suspended')
        .eq('id', telegramUserId)
        .single();
      
      if (profileError) {
        console.error("[ROUTER] ❌ Error checking user suspension status:", profileError);
      } else if (userProfile?.is_suspended) {
        console.log("[ROUTER] 🚫 Suspended user attempted action:", telegramUserId);
        return new Response(JSON.stringify({ 
          ok: true,
          message: "User is suspended" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Route: Chat Join Requests
    if (body.chat_join_request) {
      console.log("[ROUTER] 🔄 Routing to chat join request handler");
      return await handleChatJoinRequest(supabaseClient, body);
    }

    // Route: Member Removal
    if (body.path === '/remove-member') {
      console.log('[ROUTER] 🔄 Routing to member removal handler');
      try {
        // Validate that we have the required parameters
        if (!body.chat_id || !body.user_id) {
          console.error('[ROUTER] ❌ Missing required parameters for member removal:', body);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters: chat_id and user_id are required' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
        
        console.log(`[ROUTER] 👤 Removing user ${body.user_id} from chat ${body.chat_id}`);
        const success = await kickMemberService(
          supabaseClient,
          body.chat_id,
          body.user_id,
          botToken
        );

        // Always invalidate invite links for this user when removing
        if (success) {
          try {
            // First get the community ID for logging
            const { data: community } = await supabaseClient
              .from('communities')
              .select('id')
              .eq('telegram_chat_id', body.chat_id)
              .single();
              
            const communityId = community?.id;
            
            // Then invalidate invite links
            const { data: invalidated, error: invalidateError } = await supabaseClient
              .from('subscription_payments')
              .update({ invite_link: null })
              .eq('telegram_user_id', body.user_id)
              .eq('community_id', communityId);
            
            if (invalidateError) {
              console.error('[ROUTER] ❌ Error invalidating invite links:', invalidateError);
              // Continue despite error as the main operation succeeded
            } else {
              console.log(`[ROUTER] 🔗 Successfully invalidated invite links for user ${body.user_id}`);
            }
            
            // Log the removal in the activity log
            await supabaseClient
              .from('subscription_activity_logs')
              .insert({
                telegram_user_id: body.user_id,
                community_id: communityId,
                activity_type: 'member_removed',
                details: 'User removed from channel by admin'
              })
              .then(({ error }) => {
                if (error) {
                  console.error('[ROUTER] ❌ Error logging removal activity:', error);
                } else {
                  console.log('[ROUTER] 📝 Removal logged to activity log');
                }
              });
          } catch (error) {
            console.error('[ROUTER] ❌ Error in invite link invalidation process:', error);
            // Continue despite error as the main operation succeeded
          }
        }

        console.log(`[ROUTER] ${success ? '✅' : '❌'} Member removal ${success ? 'successful' : 'failed'}`);
        return new Response(JSON.stringify({ success }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('[ROUTER] ❌ Error removing member:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: error.message || 'An unknown error occurred' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
    }

    // Route: Chat Member Updates
    if (body.chat_member) {
      console.log('[ROUTER] 👥 Routing to chat member update handler');
      await handleChatMemberUpdate(supabaseClient, body.chat_member);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Route: My Chat Member Updates (when bot status changes)
    if (body.my_chat_member) {
      console.log('[ROUTER] 🤖 Routing to my chat member update handler');
      await handleMyChatMember(supabaseClient, body.my_chat_member);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle regular messages
    const update = body;
    const message = update.message || update.channel_post;
    
    if (!message) {
      console.log("[ROUTER] ℹ️ No message or channel_post in update:", JSON.stringify(update, null, 2));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[ROUTER] 🗨️ Processing message:', JSON.stringify(message, null, 2));

    // Update user activity if we have a user ID
    if (message.from?.id) {
      await updateMemberActivity(supabaseClient, message.from.id.toString());
    }

    let handled = false;

    // Route: Channel Verification
    if (['group', 'supergroup', 'channel'].includes(message.chat?.type) && message.text?.includes('MBF_')) {
      console.log("[ROUTER] 🔄 Routing to channel verification handler");
      handled = await handleChannelVerification(supabaseClient, message, botToken);
      console.log(`[ROUTER] ${handled ? '✅' : '❌'} Channel verification ${handled ? 'handled successfully' : 'not handled'}`);
    }
    // Route: Start Command
    else if (message.text?.startsWith('/start')) {
      console.log("[ROUTER] 🚀 Routing to start command handler");
      handled = await handleStartCommand(supabaseClient, message, botToken);
      console.log(`[ROUTER] ${handled ? '✅' : '❌'} Start command ${handled ? 'handled successfully' : 'not handled'}`);
    }
    // Route: Verification Message
    else if (message.text?.startsWith('MBF_')) {
      console.log("[ROUTER] 🔄 Routing to verification message handler");
      handled = await handleVerificationMessage(supabaseClient, message);
      console.log(`[ROUTER] ${handled ? '✅' : '❌'} Verification ${handled ? 'handled successfully' : 'not handled'}`);
    }

    // Log event to database
    try {
      console.log("[ROUTER] 📝 Logging event to database");
      await supabaseClient
        .from('telegram_events')
        .insert({
          event_type: update.channel_post ? 'channel_post' : 'webhook_update',
          raw_data: update,
          handled: handled,
          chat_id: message.chat?.id?.toString(),
          message_text: message.text,
          username: message.from?.username,
          user_id: message.from?.id?.toString()
        });
      console.log("[ROUTER] ✅ Event logged successfully");
    } catch (logError) {
      console.error("[ROUTER] ❌ Error logging event:", logError);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ROUTER] ❌ Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
