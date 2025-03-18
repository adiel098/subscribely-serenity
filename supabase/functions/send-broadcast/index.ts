
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log(`🔄 [SEND-BROADCAST] Request received: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 [SEND-BROADCAST] Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [SEND-BROADCAST] Missing Supabase environment variables');
      throw new Error('Server configuration error: Missing Supabase credentials');
    }
    
    console.log(`✅ [SEND-BROADCAST] Supabase environment variables loaded`);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log(`✅ [SEND-BROADCAST] Request body parsed:`, JSON.stringify(requestBody));
    } catch (parseError) {
      console.error(`❌ [SEND-BROADCAST] Failed to parse request body:`, parseError);
      throw new Error('Invalid request format: Failed to parse JSON body');
    }
    
    const { 
      broadcast_id, 
      entity_id, 
      entity_type, 
      filter_type, 
      subscription_plan_id,
      include_button,
      image
    } = requestBody;

    // Validate required parameters
    if (!broadcast_id) {
      console.error('❌ [SEND-BROADCAST] Missing broadcast_id parameter');
      throw new Error('Missing required parameter: broadcast_id');
    }
    
    if (!entity_id) {
      console.error('❌ [SEND-BROADCAST] Missing entity_id parameter');
      throw new Error('Missing required parameter: entity_id');
    }
    
    if (!entity_type) {
      console.error('❌ [SEND-BROADCAST] Missing entity_type parameter');
      throw new Error('Missing required parameter: entity_type');
    }

    console.log(`📝 [SEND-BROADCAST] Processing broadcast ${broadcast_id} for ${entity_type} ${entity_id}`);
    console.log(`📝 [SEND-BROADCAST] Filter type: ${filter_type || 'all'}`);
    console.log(`📝 [SEND-BROADCAST] Include button: ${include_button ? 'Yes' : 'No'}`);
    console.log(`📝 [SEND-BROADCAST] Has image: ${image ? 'Yes' : 'No'}`);
    
    if (filter_type === 'plan') {
      console.log(`📝 [SEND-BROADCAST] Using subscription plan filter: ${subscription_plan_id || 'Not specified'}`);
      if (!subscription_plan_id) {
        console.warn('⚠️ [SEND-BROADCAST] Plan filter specified but no subscription_plan_id provided');
      }
    }

    // Get the broadcast message
    console.log(`🔍 [SEND-BROADCAST] Fetching broadcast record ${broadcast_id}`);
    const { data: broadcast, error: broadcastError } = await supabase
      .from('broadcast_messages')
      .select('*')
      .eq('id', broadcast_id)
      .single();

    if (broadcastError) {
      console.error(`❌ [SEND-BROADCAST] Error fetching broadcast:`, broadcastError);
      throw new Error(`Broadcast not found: ${broadcastError.message || 'Unknown error'}`);
    }

    if (!broadcast) {
      console.error(`❌ [SEND-BROADCAST] Broadcast record not found for ID: ${broadcast_id}`);
      throw new Error('Broadcast record not found');
    }

    console.log(`✅ [SEND-BROADCAST] Broadcast record retrieved successfully`);
    console.log(`📝 [SEND-BROADCAST] Broadcast message length: ${broadcast.message?.length || 0} characters`);

    // Call the Telegram webhook to send the broadcast
    console.log(`🔄 [SEND-BROADCAST] Invoking telegram-webhook function`);
    const webhook_payload = {
      action: 'broadcast',
      community_id: entity_id, // Use entity_id directly since we now store everything in community_id
      entity_type: entity_type, // Still pass the entity_type so the webhook knows what kind of entity it is
      message: broadcast.message,
      filter_type: filter_type || 'all',
      subscription_plan_id: subscription_plan_id,
      include_button: include_button || false,
      image: image || null
    };
    
    console.log(`📦 [SEND-BROADCAST] Webhook payload:`, JSON.stringify(webhook_payload));
    
    try {
      const response = await supabase.functions.invoke('telegram-webhook', {
        body: webhook_payload
      });

      console.log(`⬅️ [SEND-BROADCAST] telegram-webhook response received:`, JSON.stringify(response));

      if (response.error) {
        console.error(`❌ [SEND-BROADCAST] Error invoking telegram-webhook function:`, response.error);
        throw new Error(`Failed to send broadcast: ${response.error || 'Unknown error'}`);
      }

      const result = response.data;
      console.log(`✅ [SEND-BROADCAST] Broadcast result:`, JSON.stringify(result));

      if (!result || typeof result.successCount === 'undefined') {
        console.error(`❌ [SEND-BROADCAST] Invalid response from telegram-webhook:`, result);
        throw new Error('Invalid response format from telegram-webhook function');
      }

      // Update the broadcast record with the results
      console.log(`🔄 [SEND-BROADCAST] Updating broadcast record with results`);
      const { error: updateError } = await supabase
        .from('broadcast_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_success: result.successCount || 0,
          sent_failed: result.failureCount || 0,
          total_recipients: result.totalRecipients || 0
        })
        .eq('id', broadcast_id);

      if (updateError) {
        console.error(`⚠️ [SEND-BROADCAST] Error updating broadcast record:`, updateError);
        console.warn(`⚠️ [SEND-BROADCAST] Continuing despite error in updating record`);
      } else {
        console.log(`✅ [SEND-BROADCAST] Broadcast record updated successfully`);
      }

      console.log(`🏁 [SEND-BROADCAST] Broadcast process completed successfully`);
      console.log(`📊 [SEND-BROADCAST] Stats: ${result.successCount || 0} messages sent, ${result.failureCount || 0} failures, ${result.totalRecipients || 0} total recipients`);

      return new Response(
        JSON.stringify({
          success: true,
          sent_success: result.successCount || 0,
          sent_failed: result.failureCount || 0,
          total_recipients: result.totalRecipients || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (webhookError) {
      console.error(`❌ [SEND-BROADCAST] Error calling telegram-webhook:`, webhookError);
      
      // Still update the broadcast record with failure status
      await supabase
        .from('broadcast_messages')
        .update({
          status: 'failed',
          sent_at: new Date().toISOString(),
          error_message: webhookError.message || 'Unknown webhook error'
        })
        .eq('id', broadcast_id);
        
      throw webhookError;
    }
  } catch (error) {
    console.error(`❌ [SEND-BROADCAST] Error processing broadcast:`, error);
    console.error(`❌ [SEND-BROADCAST] Stack trace:`, error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
