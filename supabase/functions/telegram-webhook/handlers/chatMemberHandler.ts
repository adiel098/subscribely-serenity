import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logMembershipChange } from './utils/logHelper.ts';
import { createOrUpdateMember } from './utils/dbLogger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleChatMemberUpdate = async (supabase: ReturnType<typeof createClient>, update: any) => {
  console.log('Processing chat member update:', update);

  if (!update.chat?.id || !update.new_chat_member?.user?.id) {
    console.error('Missing required chat member data:', { update });
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
      console.error('Error finding community:', communityError);
      return new Response(JSON.stringify({ error: 'Community not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }

    console.log('Found community:', community.id);

    const telegramUserId = update.new_chat_member.user.id.toString();
    const username = update.new_chat_member.user.username;
    const status = update.new_chat_member.status;

    // If user joins the chat
    if (['member', 'administrator', 'creator'].includes(update.new_chat_member.status)) {
      console.log('User joined chat:', {
        userId: telegramUserId,
        status: update.new_chat_member.status
      });

      // Check if there's an existing member record
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('telegram_chat_members')
        .select('id, subscription_status, subscription_plan_id, subscription_end_date')
        .eq('telegram_user_id', telegramUserId)
        .eq('community_id', community.id)
        .maybeSingle();
      
      console.log('Existing member check:', { 
        found: !!existingMember, 
        data: existingMember, 
        error: memberCheckError 
      });
      
      // If we don't have a member record, try to find a payment
      if (!existingMember) {
        console.log('No member record found, checking for payments');
        
        // Find the most recent payment for this user
        const { data: payments, error: paymentsError } = await supabase
          .from('subscription_payments')
          .select('*')
          .eq('community_id', community.id)
          .eq('status', 'successful')
          .or(`telegram_user_id.eq.${telegramUserId},telegram_username.eq.${username || ''}`)
          .order('created_at', { ascending: false })
          .limit(1);

        console.log('Payment search result:', {
          found: payments?.length > 0,
          payments,
          error: paymentsError
        });

        if (payments?.length > 0) {
          const payment = payments[0];
          
          // Update payment with telegram_user_id if it's not set
          if (!payment.telegram_user_id) {
            console.log(`Updating payment ${payment.id} with telegram_user_id ${telegramUserId}`);
            await supabase
              .from('subscription_payments')
              .update({ telegram_user_id: telegramUserId })
              .eq('id', payment.id);
          }

          // Calculate subscription dates based on the plan
          const subscriptionStartDate = new Date();
          let subscriptionEndDate = new Date(subscriptionStartDate);
          
          if (payment.plan_id) {
            const { data: plan } = await supabase
              .from('subscription_plans')
              .select('interval')
              .eq('id', payment.plan_id)
              .single();

            console.log('Found plan for payment:', plan);

            if (plan) {
              if (plan.interval === 'monthly') {
                subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
              } else if (plan.interval === 'yearly') {
                subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 365);
              } else if (plan.interval === 'half-yearly') {
                subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
              } else if (plan.interval === 'quarterly') {
                subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
              } else {
                // Default to 30 days
                subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
              }
            } else {
              // Default to 30 days if no plan is found
              subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
            }
          } else {
            // Default to 30 days if no plan ID
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
          }

          // Create member record with subscription info
          const memberResult = await createOrUpdateMember(supabase, {
            telegram_user_id: telegramUserId,
            telegram_username: username,
            community_id: community.id,
            is_active: true,
            subscription_status: true,
            subscription_plan_id: payment.plan_id,
            subscription_start_date: subscriptionStartDate.toISOString(),
            subscription_end_date: subscriptionEndDate.toISOString(),
          });

          console.log('Member record creation result:', memberResult);
        } else {
          // No payment found, just create a basic member record
          console.log('No payment found, creating basic member record');
          const memberResult = await createOrUpdateMember(supabase, {
            telegram_user_id: telegramUserId,
            telegram_username: username,
            community_id: community.id,
            is_active: true,
            subscription_status: false
          });
          
          console.log('Basic member record creation result:', memberResult);
        }
      } else {
        // Update existing member record as active
        console.log('Updating existing member record as active');
        const memberResult = await createOrUpdateMember(supabase, {
          telegram_user_id: telegramUserId,
          telegram_username: username,
          community_id: community.id,
          is_active: true,
          // Keep existing subscription data
          subscription_status: existingMember.subscription_status,
          subscription_plan_id: existingMember.subscription_plan_id,
          subscription_end_date: existingMember.subscription_end_date
        });
        
        console.log('Member record update result:', memberResult);
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
      await updateCommunityMemberCount(supabase, community.id);
    }
    // If user leaves chat
    else if (update.new_chat_member.status === 'left' || update.new_chat_member.status === 'kicked') {
      console.log('User left chat:', telegramUserId);

      // Update member record as inactive
      const memberResult = await createOrUpdateMember(supabase, {
        telegram_user_id: telegramUserId,
        telegram_username: username,
        community_id: community.id,
        is_active: false,
        subscription_status: false
      });
      
      console.log('Member record update result (left/kicked):', memberResult);
      
      // Log the membership change
      await logMembershipChange(
        supabase,
        update.chat.id.toString(),
        telegramUserId,
        username,
        'removed',
        `User ${update.new_chat_member.status} from group`,
        update
      );
      
      // Update the community member count
      await updateCommunityMemberCount(supabase, community.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in chat member handler:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
};

// Helper function to update the community member count
async function updateCommunityMemberCount(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    // Count active members
    const { count: memberCount, error: countError } = await supabase
      .from('telegram_chat_members')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true);
    
    if (countError) {
      console.error('Error counting members:', countError);
      return;
    }
    
    // Count active subscribers
    const { count: subscriptionCount, error: subCountError } = await supabase
      .from('telegram_chat_members')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', communityId)
      .eq('is_active', true)
      .eq('subscription_status', true);
    
    if (subCountError) {
      console.error('Error counting subscribers:', subCountError);
      return;
    }
    
    // Update community record
    const { error: updateError } = await supabase
      .from('communities')
      .update({ 
        member_count: memberCount || 0,
        subscription_count: subscriptionCount || 0
      })
      .eq('id', communityId);
    
    if (updateError) {
      console.error('Error updating community counts:', updateError);
    } else {
      console.log(`Updated community ${communityId} counts: members=${memberCount}, subscriptions=${subscriptionCount}`);
    }
  } catch (error) {
    console.error('Error in updateCommunityMemberCount:', error);
  }
}
