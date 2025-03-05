
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // If user joins the chat
    if (['member', 'administrator', 'creator'].includes(update.new_chat_member.status)) {
      console.log('User joined chat:', {
        userId: telegramUserId,
        status: update.new_chat_member.status
      });

      // Find the most recent payment for this user
      const { data: payment } = await supabase
        .from('subscription_payments')
        .select('*')
        .eq('community_id', community.id)
        .eq('status', 'completed')
        .is('telegram_user_id', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (payment) {
        // Update payment with telegram_user_id
        await supabase
          .from('subscription_payments')
          .update({ telegram_user_id: telegramUserId })
          .eq('id', payment.id);

        // Calculate subscription dates based on the plan
        const subscriptionStartDate = new Date();
        const subscriptionEndDate = new Date();
        if (payment.plan_id) {
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('interval')
            .eq('id', payment.plan_id)
            .single();

          if (plan) {
            if (plan.interval === 'monthly') {
              subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
            } else if (plan.interval === 'yearly') {
              subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 365);
            }
          }
        }

        // Create or update member record
        const { error: memberError } = await supabase
          .from('telegram_chat_members')
          .upsert({
            telegram_user_id: telegramUserId,
            telegram_username: username,
            community_id: community.id,
            is_active: true,
            subscription_status: true,
            subscription_plan_id: payment.plan_id,
            subscription_start_date: subscriptionStartDate.toISOString(),
            subscription_end_date: subscriptionEndDate.toISOString(),
            last_active: new Date().toISOString()
          }, {
            onConflict: 'telegram_user_id,community_id'
          });

        if (memberError) {
          console.error('Error updating member:', memberError);
          return new Response(JSON.stringify({ error: 'Failed to update member' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }
      }
      
      // Update the community member count
      await updateCommunityMemberCount(supabase, community.id);
    }
    // If user leaves chat
    else if (update.new_chat_member.status === 'left') {
      console.log('User left chat:', telegramUserId);

      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({ 
          is_active: false,
          last_active: new Date().toISOString()
        })
        .eq('community_id', community.id)
        .eq('telegram_user_id', telegramUserId);

      if (updateError) {
        console.error('Error updating member status:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update member status' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        });
      }
      
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
