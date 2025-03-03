
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, telegram_id, community_id, subscription_id, subscription_plan_id, status, payment_id } = await req.json();
    console.log(`Received request with action: ${action}, telegram_id: ${telegram_id}`);

    if (action === 'get_subscriptions') {
      if (!telegram_id) {
        throw new Error('Telegram ID is required');
      }

      // Get user subscriptions
      const { data: subscriptions, error } = await supabase
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
          subscription_plan_id,
          communities!telegram_chat_members_community_id_fkey (
            id,
            name,
            description,
            telegram_photo_url,
            telegram_invite_link
          ),
          subscription_plans(
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
        throw error;
      }

      // Transform the data to match the expected structure
      const formattedSubscriptions = subscriptions.map(sub => ({
        id: sub.id,
        telegram_user_id: sub.telegram_user_id,
        telegram_username: sub.telegram_username,
        joined_at: sub.joined_at,
        last_active: sub.last_active,
        subscription_start_date: sub.subscription_start_date,
        subscription_end_date: sub.subscription_end_date,
        subscription_status: sub.subscription_status,
        total_messages: sub.total_messages,
        community_id: sub.community_id,
        community: sub.communities,
        plan: sub.subscription_plans && sub.subscription_plans.length > 0 
          ? sub.subscription_plans[0] 
          : null,
      }));

      console.log(`Found ${formattedSubscriptions.length} subscriptions for user ${telegram_id}`);
      return new Response(
        JSON.stringify({ subscriptions: formattedSubscriptions }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      );
    } 
    else if (action === 'cancel_subscription') {
      if (!subscription_id) {
        throw new Error('Subscription ID is required');
      }

      // Update subscription status
      const { error } = await supabase
        .from('telegram_chat_members')
        .update({ 
          subscription_status: false 
        })
        .eq('id', subscription_id);

      if (error) {
        console.error('Error cancelling subscription:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription cancelled successfully' }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      );
    }
    else if (action === 'create_or_update_member') {
      if (!telegram_id || !community_id || !subscription_plan_id) {
        throw new Error('Missing required parameters for member update');
      }

      // Check if member exists
      const { data: existingMember, error: fetchError } = await supabase
        .from('telegram_chat_members')
        .select('id')
        .eq('telegram_user_id', telegram_id)
        .eq('community_id', community_id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking for existing member:', fetchError);
        throw fetchError;
      }

      // Get plan details to calculate subscription end date
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', subscription_plan_id)
        .single();

      if (planError) {
        console.error('Error fetching plan details:', planError);
        throw planError;
      }

      // Calculate subscription end date based on plan interval
      const startDate = new Date();
      let endDate = new Date(startDate);
      
      switch(planData.interval) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'half-yearly':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        case 'one-time':
          // For one-time, set to 100 years in the future as effectively permanent
          endDate.setFullYear(endDate.getFullYear() + 100);
          break;
        default:
          // Default to 30 days if interval is unknown
          endDate.setDate(endDate.getDate() + 30);
      }

      if (existingMember) {
        // Update existing member
        const { error: updateError } = await supabase
          .from('telegram_chat_members')
          .update({
            subscription_plan_id,
            subscription_status: true,
            is_active: true,
            subscription_start_date: startDate.toISOString(),
            subscription_end_date: endDate.toISOString()
          })
          .eq('id', existingMember.id);

        if (updateError) {
          console.error('Error updating member:', updateError);
          throw updateError;
        }
      } else {
        // Create new member
        const { error: insertError } = await supabase
          .from('telegram_chat_members')
          .insert({
            telegram_user_id: telegram_id,
            community_id,
            subscription_plan_id,
            subscription_status: true,
            is_active: true,
            subscription_start_date: startDate.toISOString(),
            subscription_end_date: endDate.toISOString()
          });

        if (insertError) {
          console.error('Error creating member:', insertError);
          throw insertError;
        }
      }

      // If payment_id is provided, update the payment status
      if (payment_id) {
        const { error: paymentError } = await supabase
          .from('subscription_payments')
          .update({ status: 'completed' })
          .eq('id', payment_id);

        if (paymentError) {
          console.error('Error updating payment status:', paymentError);
          // Don't throw here, as the member update was successful
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Member updated successfully' }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          },
          status: 200 
        }
      );
    }
    else {
      throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400 
      }
    );
  }
});
