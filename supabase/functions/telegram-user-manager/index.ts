
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  action: string;
  telegram_id?: string;
  community_id?: string;
  subscription_plan_id?: string;
  status?: string;
  payment_id?: string;
  subscription_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    // Initialize Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the webhook payload
    const payload: WebhookPayload = await req.json();
    console.log("Received payload:", payload);

    const { action } = payload;

    // Handle different actions
    switch (action) {
      case 'get_subscriptions':
        return await handleGetSubscriptions(payload, supabase);
      
      case 'create_or_update_member':
        return await handleCreateOrUpdateMember(payload, supabase);
      
      case 'cancel_subscription':
        return await handleCancelSubscription(payload, supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function handleGetSubscriptions(payload: WebhookPayload, supabase: any) {
  const { telegram_id } = payload;
  
  if (!telegram_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  console.log(`Fetching subscriptions for Telegram user ID: ${telegram_id}`);

  // Get the member data including related community and plan information
  const { data, error } = await supabase
    .from('telegram_chat_members')
    .select(`
      id,
      telegram_user_id,
      telegram_username,
      joined_at,
      last_active,
      subscription_start_date,
      subscription_end_date,
      subscription_status,
      total_messages,
      community_id,
      community:communities(
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
    .eq('telegram_user_id', telegram_id);

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Transform the data to the expected format
  const subscriptions = data.map(item => ({
    id: item.id,
    telegram_user_id: item.telegram_user_id,
    telegram_username: item.telegram_username,
    joined_at: item.joined_at,
    last_active: item.last_active,
    subscription_start_date: item.subscription_start_date,
    subscription_end_date: item.subscription_end_date,
    subscription_status: item.subscription_status,
    total_messages: item.total_messages,
    community_id: item.community_id,
    community: item.community,
    plan: item.plan,
    expiry_date: item.subscription_end_date // For compatibility
  }));

  console.log(`Found ${subscriptions.length} subscriptions.`);
  
  return new Response(
    JSON.stringify({ subscriptions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCreateOrUpdateMember(payload: WebhookPayload, supabase: any) {
  const { telegram_id, community_id, subscription_plan_id, status, payment_id } = payload;
  
  if (!telegram_id || !community_id || !subscription_plan_id) {
    return new Response(
      JSON.stringify({ error: 'telegram_id, community_id, and subscription_plan_id are required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  console.log(`Creating/updating member with Telegram ID: ${telegram_id} for community: ${community_id}`);

  try {
    // Get plan details to calculate subscription end date
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('interval, price')
      .eq('id', subscription_plan_id)
      .single();

    if (planError) {
      throw new Error(`Error fetching plan details: ${planError.message}`);
    }

    // Calculate subscription end date based on plan interval
    const startDate = new Date();
    let endDate = new Date(startDate);

    if (planData.interval === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planData.interval === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (planData.interval === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else if (planData.interval === 'daily') {
      endDate.setDate(endDate.getDate() + 1);
    } else {
      // Default to 30 days if interval is not recognized
      endDate.setDate(endDate.getDate() + 30);
    }

    // Upsert the telegram_chat_members record
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .upsert({
        telegram_user_id: telegram_id,
        community_id: community_id,
        subscription_plan_id: subscription_plan_id,
        subscription_status: status === 'active',
        is_active: true,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        is_trial: false,
      })
      .select();

    if (error) {
      throw new Error(`Error upserting member: ${error.message}`);
    }

    console.log(`Successfully created/updated member with ID: ${data[0]?.id}`);

    // Log subscription activity
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: telegram_id,
        community_id: community_id,
        activity_type: 'subscription_created',
        details: `Plan: ${subscription_plan_id}, Payment: ${payment_id || 'N/A'}`
      });

    // Log community event
    await supabase
      .from('community_logs')
      .insert({
        community_id: community_id,
        user_id: telegram_id,
        event_type: 'subscription_created',
        metadata: { 
          plan_id: subscription_plan_id,
          payment_id: payment_id,
          amount: planData.price
        },
        amount: planData.price
      });

    return new Response(
      JSON.stringify({ success: true, data: data[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in createOrUpdateMember:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

async function handleCancelSubscription(payload: WebhookPayload, supabase: any) {
  const { subscription_id } = payload;
  
  if (!subscription_id) {
    return new Response(
      JSON.stringify({ error: 'subscription_id is required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }

  console.log(`Cancelling subscription with ID: ${subscription_id}`);

  try {
    // Get the subscription details first
    const { data: memberData, error: fetchError } = await supabase
      .from('telegram_chat_members')
      .select('telegram_user_id, community_id, subscription_plan_id')
      .eq('id', subscription_id)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching subscription details: ${fetchError.message}`);
    }

    // Update the member record to cancel the subscription
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .update({
        subscription_status: false
      })
      .eq('id', subscription_id)
      .select();

    if (error) {
      throw new Error(`Error cancelling subscription: ${error.message}`);
    }

    console.log(`Successfully cancelled subscription with ID: ${subscription_id}`);

    // Log subscription cancellation activity
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: memberData.telegram_user_id,
        community_id: memberData.community_id,
        activity_type: 'subscription_expired',
        details: `Cancelled by user. Plan: ${memberData.subscription_plan_id}`
      });

    // Log community event
    await supabase
      .from('community_logs')
      .insert({
        community_id: memberData.community_id,
        user_id: memberData.telegram_user_id,
        event_type: 'subscription_expired',
        metadata: { cancelled_by_user: true }
      });

    return new Response(
      JSON.stringify({ success: true, data: data[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}
