
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { action, telegram_id, subscription_id, community_id, subscription_plan_id, status, payment_id } = payload;

    console.log(`Processing request with action: ${action}`);

    switch (action) {
      case 'get_subscriptions':
        return await getSubscriptions(telegram_id);
      case 'cancel_subscription':
        return await cancelSubscription(subscription_id);
      case 'create_or_update_member':
        return await createOrUpdateMember(telegram_id, community_id, subscription_plan_id, status, payment_id);
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function getSubscriptions(telegramId: string) {
  if (!telegramId) {
    return new Response(
      JSON.stringify({ error: 'Telegram ID is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    console.log(`Fetching subscriptions for Telegram ID: ${telegramId}`);
    
    // Specify the exact foreign key relationship to use
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .select(`
        *,
        community:communities!telegram_chat_members_community_id_fkey(
          id,
          name,
          description,
          telegram_photo_url,
          telegram_invite_link
        ),
        plan:subscription_plans(
          id,
          name,
          description,
          price,
          interval
        )
      `)
      .eq('telegram_user_id', telegramId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Database error fetching subscriptions:', error);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

    console.log(`Found ${data?.length || 0} subscriptions`);
    
    return new Response(
      JSON.stringify({ subscriptions: data || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in getSubscriptions:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function cancelSubscription(subscriptionId: string) {
  if (!subscriptionId) {
    return new Response(
      JSON.stringify({ error: 'Subscription ID is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    console.log(`Cancelling subscription with ID: ${subscriptionId}`);
    
    // Find the subscription to get necessary data
    const { data: subscription, error: fetchError } = await supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (fetchError) {
      console.error('Error fetching subscription:', fetchError);
      throw new Error(`Subscription not found: ${fetchError.message}`);
    }

    // Update the subscription status
    const { error: updateError } = await supabase
      .from('telegram_chat_members')
      .update({
        subscription_status: false,
      })
      .eq('id', subscriptionId);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      throw new Error(`Failed to cancel subscription: ${updateError.message}`);
    }
    
    // Log the cancellation
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: subscription.telegram_user_id,
        community_id: subscription.community_id,
        activity_type: 'subscription_cancelled',
        details: `Subscription cancelled via mini app`
      });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cancelSubscription:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function createOrUpdateMember(
  telegramId: string, 
  communityId: string, 
  planId: string, 
  status = 'active',
  paymentId?: string
) {
  if (!telegramId || !communityId || !planId) {
    return new Response(
      JSON.stringify({ error: 'Telegram ID, Community ID, and Plan ID are required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  try {
    console.log(`Creating/updating member with Telegram ID: ${telegramId}, Community: ${communityId}, Plan: ${planId}`);
    
    // Get plan details to determine subscription duration
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError) {
      console.error('Error fetching plan:', planError);
      throw new Error(`Plan not found: ${planError.message}`);
    }

    // Calculate subscription end date based on plan interval
    const startDate = new Date();
    let endDate = new Date(startDate);
    
    if (planData.interval === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planData.interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (planData.interval === 'week') {
      endDate.setDate(endDate.getDate() + 7);
    } else if (planData.interval === 'day') {
      endDate.setDate(endDate.getDate() + 1);
    } else {
      // Default to 30 days if interval is not recognized
      endDate.setDate(endDate.getDate() + 30);
    }

    // Check if user already exists in the group
    const { data: existingMember, error: memberError } = await supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('telegram_user_id', telegramId)
      .eq('community_id', communityId)
      .maybeSingle();

    let result;

    if (existingMember) {
      // Update existing member
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: true,
          is_active: true,
          subscription_plan_id: planId,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
          last_active: new Date().toISOString()
        })
        .eq('telegram_user_id', telegramId)
        .eq('community_id', communityId);

      if (updateError) {
        console.error('Error updating member:', updateError);
        throw new Error(`Failed to update member: ${updateError.message}`);
      }
      
      result = { success: true, action: 'updated' };
    } else {
      // Create new member
      const { error: insertError } = await supabase
        .from('telegram_chat_members')
        .insert({
          telegram_user_id: telegramId,
          community_id: communityId,
          subscription_status: true,
          is_active: true,
          subscription_plan_id: planId,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString()
        });

      if (insertError) {
        console.error('Error creating member:', insertError);
        throw new Error(`Failed to create member: ${insertError.message}`);
      }
      
      result = { success: true, action: 'created' };
    }

    // Log the subscription activity
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: telegramId,
        community_id: communityId,
        activity_type: existingMember ? 'subscription_renewed' : 'subscription_created',
        details: `Plan: ${planData.name}, Payment ID: ${paymentId || 'N/A'}`
      });

    // If payment ID is provided, update payment record as completed
    if (paymentId) {
      await supabase
        .from('subscription_payments')
        .update({
          status: 'completed'
        })
        .eq('id', paymentId);
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in createOrUpdateMember:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
