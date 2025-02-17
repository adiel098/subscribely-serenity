
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';
import { 
  handleChatMemberUpdate,
  handleChatJoinRequest,
  handleMyChatMember,
  updateMemberActivity,
  getBotChatMember
} from './membershipHandler.ts';
import { sendBroadcastMessage } from './broadcastHandler.ts';

interface AnalyticsEvent {
  event_type: 'member_joined' | 'member_left' | 'notification_sent' | 'subscription_expired' | 'subscription_renewed' | 'payment_received';
  community_id: string;
  user_id?: string | null;
  metadata?: Record<string, any>;
  amount?: number | null;
}

async function logAnalyticsEvent(supabase: any, event: AnalyticsEvent) {
  try {
    console.log('Logging analytics event:', event);
    const { error } = await supabase
      .from('analytics_events')
      .insert([event]);

    if (error) {
      console.error('Error logging analytics event:', error);
      throw error;
    }

    console.log('Successfully logged analytics event');
  } catch (err) {
    console.error('Failed to log analytics event:', err);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Check if this is a direct webhook update from Telegram
    if (body.chat_member || body.my_chat_member || body.chat_join_request) {
      console.log('Received direct Telegram webhook update:', body);
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (body.chat_member) {
        const result = await handleChatMemberUpdate(supabase, body);
        // Log member status changes
        if (result?.event) {
          await logAnalyticsEvent(supabase, {
            event_type: result.event as any,
            community_id: result.communityId,
            user_id: result.userId,
            metadata: {
              telegram_user_id: body.chat_member.from.id,
              username: body.chat_member.from.username,
              status: body.chat_member.new_chat_member.status
            }
          });
        }
      } else if (body.my_chat_member) {
        await handleMyChatMember(supabase, body);
      } else if (body.chat_join_request) {
        await handleChatJoinRequest(supabase, body);
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      });
    }

    // Handle other API endpoints
    const { path, communityId } = body;
    console.log('Received API request:', { path, communityId });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let response;

    switch (path) {
      case '/update-activity':
        await updateMemberActivity(supabase, communityId);
        response = { ok: true };
        break;

      case '/broadcast':
        if (!communityId || !body.message) {
          throw new Error('Missing required parameters');
        }

        response = await sendBroadcastMessage(
          supabase,
          communityId,
          body.message,
          body.filterType || 'all',
          body.subscriptionPlanId,
          body.includeButton
        );

        // Log broadcast event
        if (response?.successCount > 0) {
          await logAnalyticsEvent(supabase, {
            event_type: 'notification_sent',
            community_id: communityId,
            metadata: {
              message: body.message,
              filter_type: body.filterType,
              success_count: response.successCount,
              failure_count: response.failureCount,
              total_recipients: response.totalRecipients
            }
          });
        }
        break;

      default:
        throw new Error(`Unknown path: ${path}`);
    }

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 500,
    });
  }
});
