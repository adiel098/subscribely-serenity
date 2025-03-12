
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all communities
    const { data: communities, error: communityError } = await supabase
      .from('communities')
      .select('id');

    if (communityError) {
      throw communityError;
    }

    console.log(`Found ${communities.length} communities to update`);

    // Update each community's member and subscription counts
    const updates = await Promise.all(
      communities.map(async (community) => {
        // Get member count - count of active members
        const { count: memberCount, error: memberError } = await supabase
          .from('community_subscribers') // Updated from telegram_chat_members
          .select('id', { count: 'exact', head: true })
          .eq('community_id', community.id)
          .eq('is_active', true);

        if (memberError) {
          console.error(`Error counting members for community ${community.id}:`, memberError);
          return null;
        }

        // Get subscription count - count of active members with active subscriptions
        const { count: subscriptionCount, error: subscriptionError } = await supabase
          .from('community_subscribers') // Updated from telegram_chat_members
          .select('id', { count: 'exact', head: true })
          .eq('community_id', community.id)
          .eq('is_active', true)
          .eq('subscription_status', 'active'); // Updated from boolean to 'active' string

        if (subscriptionError) {
          console.error(`Error counting subscriptions for community ${community.id}:`, subscriptionError);
          return null;
        }

        // Calculate total revenue
        const { data: payments, error: paymentError } = await supabase
          .from('subscription_payments')
          .select('amount')
          .eq('community_id', community.id)
          .eq('status', 'completed');

        let totalRevenue = 0;
        if (!paymentError && payments) {
          totalRevenue = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
        } else if (paymentError) {
          console.error(`Error calculating revenue for community ${community.id}:`, paymentError);
        }

        // Update the community with the counts
        const { error: updateError } = await supabase
          .from('communities')
          .update({
            member_count: memberCount || 0,
            subscription_count: subscriptionCount || 0,
            subscription_revenue: totalRevenue,
            updated_at: new Date().toISOString()
          })
          .eq('id', community.id);

        if (updateError) {
          console.error(`Error updating community ${community.id}:`, updateError);
          return null;
        }

        return {
          id: community.id,
          member_count: memberCount,
          subscription_count: subscriptionCount,
          subscription_revenue: totalRevenue
        };
      })
    );

    const successfulUpdates = updates.filter(Boolean);
    
    return new Response(
      JSON.stringify({ 
        message: 'Community counts updated successfully', 
        updated: successfulUpdates.length,
        details: successfulUpdates 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error updating community counts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
