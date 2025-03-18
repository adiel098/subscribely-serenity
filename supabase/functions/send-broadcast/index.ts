
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { 
      broadcast_id, 
      entity_id, 
      entity_type, 
      filter_type, 
      subscription_plan_id,
      include_button,
      image
    } = await req.json();

    if (!broadcast_id || !entity_id || !entity_type) {
      throw new Error('Missing required parameters');
    }

    console.log(`Processing broadcast: ${broadcast_id} for ${entity_type} ${entity_id}`);
    console.log(`Include button: ${include_button}, Has image: ${!!image}`);

    // Get the broadcast message
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcast_messages')
      .select('*')
      .eq('id', broadcast_id)
      .single();

    if (broadcastError || !broadcast) {
      console.error('Error fetching broadcast:', broadcastError);
      throw new Error(`Broadcast not found: ${broadcastError?.message || 'Unknown error'}`);
    }

    // Call the Telegram webhook to send the broadcast
    const response = await supabase.functions.invoke('telegram-webhook', {
      body: {
        action: 'broadcast',
        community_id: entity_type === 'community' ? entity_id : null,
        group_id: entity_type === 'group' ? entity_id : null,
        message: broadcast.message,
        filter_type: filter_type || 'all',
        subscription_plan_id: subscription_plan_id,
        include_button: include_button || false,
        image: image || null
      }
    });

    if (response.error) {
      console.error('Error invoking telegram-webhook function:', response.error);
      throw new Error(`Failed to send broadcast: ${response.error.message}`);
    }

    const result = response.data;
    console.log('Broadcast result:', result);

    // Update the broadcast record with the results
    const { error: updateError } = await supabase
      .from('broadcast_messages')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_success: result.successCount,
        sent_failed: result.failureCount,
        total_recipients: result.totalRecipients
      })
      .eq('id', broadcast_id);

    if (updateError) {
      console.error('Error updating broadcast record:', updateError);
      // Continue despite error in updating record
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent_success: result.successCount,
        sent_failed: result.failureCount,
        total_recipients: result.totalRecipients
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing broadcast:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
