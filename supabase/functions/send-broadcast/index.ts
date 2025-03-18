
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { broadcast_id, entity_id, entity_type, filter_type, subscription_plan_id } = await req.json();
    
    if (!broadcast_id || !entity_id || !entity_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🚀 Processing broadcast ${broadcast_id} for ${entity_type} ${entity_id}`);
    console.log('Filter type:', filter_type);

    // Get the broadcast message
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcast_messages')
      .select('*')
      .eq('id', broadcast_id)
      .single();
    
    if (broadcastError || !broadcast) {
      console.error('Error fetching broadcast:', broadcastError);
      return new Response(
        JSON.stringify({ error: 'Broadcast not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Get the recipients based on filter
    let recipients: { telegram_user_id: string }[] = [];
    
    // If it's a group, we need to fetch recipients from all communities in the group
    if (entity_type === 'group') {
      // First get all communities in the group using community_relationships table
      const { data: groupCommunities, error: groupError } = await supabase
        .from('community_relationships')
        .select('member_id')
        .eq('community_id', entity_id)
        .eq('relationship_type', 'group');
      
      if (groupError) {
        console.error('Error fetching group communities:', groupError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch group communities', details: groupError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      if (!groupCommunities || groupCommunities.length === 0) {
        console.log('No communities found in group');
        return new Response(
          JSON.stringify({ error: 'No communities found in group' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      const communityIds = groupCommunities.map(gc => gc.member_id);
      
      // Now fetch all members from these communities based on filter
      const query = supabase
        .from('community_subscribers')
        .select('telegram_user_id')
        .in('community_id', communityIds)
        .eq('is_active', true);
      
      if (filter_type === 'active') {
        query.eq('subscription_status', 'active');
      } else if (filter_type === 'expired') {
        query.eq('subscription_status', 'expired');
      } else if (filter_type === 'plan' && subscription_plan_id) {
        query.eq('subscription_plan_id', subscription_plan_id);
      }
      
      const { data: groupMembers, error: membersError } = await query;
      
      if (membersError) {
        console.error('Error fetching group members:', membersError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch group members', details: membersError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      recipients = groupMembers || [];
    } else {
      // Get recipients from a single community
      const query = supabase
        .from('community_subscribers')
        .select('telegram_user_id')
        .eq('community_id', entity_id)
        .eq('is_active', true);
      
      if (filter_type === 'active') {
        query.eq('subscription_status', 'active');
      } else if (filter_type === 'expired') {
        query.eq('subscription_status', 'expired');
      } else if (filter_type === 'plan' && subscription_plan_id) {
        query.eq('subscription_plan_id', subscription_plan_id);
      }
      
      const { data: communityMembers, error: membersError } = await query;
      
      if (membersError) {
        console.error('Error fetching community members:', membersError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch community members', details: membersError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      recipients = communityMembers || [];
    }
    
    // Deduplicate recipients (in case of overlapping communities in a group)
    const uniqueRecipients = [...new Map(recipients.map(item => 
      [item.telegram_user_id, item]
    )).values()];
    
    console.log(`📨 Sending broadcast to ${uniqueRecipients.length} recipients`);
    
    // Update broadcast with total recipients
    await supabase
      .from('broadcast_messages')
      .update({
        status: 'sending',
        total_recipients: uniqueRecipients.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', broadcast_id);
    
    let sentSuccess = 0;
    let sentFailed = 0;
    
    // Send messages
    for (const recipient of uniqueRecipients) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chat_id: recipient.telegram_user_id,
            text: broadcast.message,
            parse_mode: 'HTML'
          })
        });
        
        const result = await response.json();
        
        if (result.ok) {
          sentSuccess++;
        } else {
          console.error(`Error sending to ${recipient.telegram_user_id}:`, result.description);
          sentFailed++;
        }
      } catch (error) {
        console.error(`Error sending to ${recipient.telegram_user_id}:`, error);
        sentFailed++;
      }
      
      // Update broadcast stats every 10 messages
      if ((sentSuccess + sentFailed) % 10 === 0) {
        await supabase
          .from('broadcast_messages')
          .update({
            sent_success: sentSuccess,
            sent_failed: sentFailed,
            updated_at: new Date().toISOString()
          })
          .eq('id', broadcast_id);
      }
    }
    
    // Update final broadcast status
    await supabase
      .from('broadcast_messages')
      .update({
        status: 'completed',
        sent_success: sentSuccess,
        sent_failed: sentFailed,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', broadcast_id);
    
    console.log(`✅ Broadcast complete: ${sentSuccess} sent, ${sentFailed} failed`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        broadcast_id, 
        total_recipients: uniqueRecipients.length,
        sent_success: sentSuccess,
        sent_failed: sentFailed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing broadcast:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred while processing the broadcast' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
