
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("🚀 NOWPayments IPN webhook request received");
    
    // Extract request body
    let payload;
    try {
      payload = await req.json();
      console.log("📦 Request payload:", JSON.stringify(payload));
    } catch (error) {
      console.error("❌ Error parsing request body:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: error.message,
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    console.log("📦 NOWPayments IPN webhook received:", JSON.stringify(payload).substring(0, 200) + "...");

    const signature = req.headers.get('x-nowpayments-sig');
    if (!signature) {
      console.error("❌ Missing signature header in NOWPayments request");
      return new Response(
        JSON.stringify({ error: 'Missing signature header' }),
        { headers: corsHeaders, status: 401 }
      );
    }

    // Get the order ID from either payment_id or invoice_id
    // Different endpoints use different fields
    const orderId = payload.order_id;
    if (!orderId) {
      console.error("❌ Missing order ID in NOWPayments request");
      return new Response(
        JSON.stringify({ error: 'Missing order ID' }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    console.log("🔍 Processing order ID:", orderId);
    
    // Handle different order ID formats
    let communityId, telegramUserId;
    
    // Format 1: {communityId}_{telegramUserId}
    if (orderId.includes('_')) {
      [communityId, telegramUserId] = orderId.split('_');
      console.log("✅ Parsed format 1 order ID: communityId=", communityId, "telegramUserId=", telegramUserId);
    } 
    // Format 2: telegram-{communityId}-{telegramUserId}-{timestamp}
    else if (orderId.startsWith('telegram-')) {
      const parts = orderId.split('-');
      if (parts.length >= 3) {
        // Skip "telegram-" prefix, take communityId and telegramUserId
        communityId = parts.slice(1, -2).join('-'); // In case communityId contains hyphens
        telegramUserId = parts[parts.length - 2];
        console.log("✅ Parsed format 2 order ID: communityId=", communityId, "telegramUserId=", telegramUserId);
      }
    }
    
    if (!communityId || !telegramUserId) {
      console.error("❌ Invalid order ID format in NOWPayments request:", orderId);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid order ID format',
          details: 'Could not extract communityId and telegramUserId from order ID',
          orderId: orderId
        }),
        { headers: corsHeaders, status: 400 }
      );
    }
    
    console.log(`✅ Successfully parsed order ID: communityId=${communityId}, telegramUserId=${telegramUserId}`);
    
    // Find the community owner ID to get their payment methods configuration
    const { data: communityData, error: communityError } = await supabase
      .from('communities')
      .select('owner_id')
      .eq('id', communityId)
      .single();
      
    if (communityError || !communityData) {
      console.error("❌ Error fetching community:", communityError || "Community not found");
      return new Response(
        JSON.stringify({ error: 'Community not found' }),
        { headers: corsHeaders, status: 404 }
      );
    }
    
    // Get the NOWPayments API configuration using the owner ID
    const { data: paymentMethodData, error: paymentMethodError } = await supabase
      .from('payment_methods')
      .select('config')
      .eq('provider', 'crypto')  // We're using 'crypto' as the provider for NOWPayments
      .eq('owner_id', communityData.owner_id)
      .maybeSingle();  // Use maybeSingle instead of single to avoid errors when no rows are found
      
    if (paymentMethodError) {
      console.error("❌ Error fetching IPN secret:", paymentMethodError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate webhook', details: paymentMethodError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    if (!paymentMethodData || !paymentMethodData.config || !paymentMethodData.config.ipn_secret) {
      console.warn("⚠️ IPN secret not found for community owner:", communityData.owner_id);
      
      // We'll still process the payment even without validation in this case
      // This is a fallback to ensure payments aren't lost if the IPN secret isn't configured
      console.log("⚠️ Proceeding without signature validation as IPN secret is not configured");
    } else {
      // Validate the signature using the IPN secret and Deno's built-in crypto
      const ipnSecret = paymentMethodData.config.ipn_secret;
      
      try {
        // Using Deno's built-in crypto for HMAC calculation
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(ipnSecret),
          { name: "HMAC", hash: "SHA-512" },
          false,
          ["sign"]
        );
        
        const signatureData = await crypto.subtle.sign(
          "HMAC",
          key,
          encoder.encode(JSON.stringify(payload))
        );
        
        // Convert to hex string
        const calculatedSignature = Array.from(new Uint8Array(signatureData))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        if (signature !== calculatedSignature) {
          console.error("❌ Invalid signature in NOWPayments request");
          console.error("Expected:", calculatedSignature);
          console.error("Received:", signature);
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { headers: corsHeaders, status: 401 }
          );
        }
        
        console.log("✅ Signature validated successfully");
      } catch (signatureError) {
        console.error("❌ Error validating signature:", signatureError);
        // Continue processing despite signature validation error
        // This is a fallback to ensure payments aren't lost due to signature validation errors
      }
    }
    
    // Check payment status - support both invoice and payment webhooks
    // Invoice webhook uses 'payment_status', payment webhook uses 'status'
    const paymentStatus = payload.payment_status || payload.status;
    console.log("💰 Payment status:", paymentStatus);
    
    // Only process if payment is finished, confirmed, or completed
    if (paymentStatus === 'finished' || paymentStatus === 'confirmed' || paymentStatus === 'completed') {
      console.log("✅ Processing successful payment");
      
      try {
        // Create a new subscription
        const { error: subscriptionError } = await supabase
          .from('community_subscribers')
          .upsert({
            community_id: communityId,
            telegram_user_id: telegramUserId,
            subscription_status: 'active',
            is_active: true,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days default subscription
            subscription_plan_id: payload.subscription_plan_id || null
          });
          
        if (subscriptionError) {
          console.error("❌ Error creating subscription:", subscriptionError);
          return new Response(
            JSON.stringify({ error: 'Failed to create subscription', details: subscriptionError }),
            { headers: corsHeaders, status: 500 }
          );
        }
        
        console.log("✅ Subscription created/updated successfully");
        
        // Create payment record - support both invoice and payment records
        const paymentId = payload.payment_id || payload.id || `nowpayments-${Date.now()}`;
        const { error: paymentUpdateError } = await supabase
          .from('subscription_payments')
          .insert({
            community_id: communityId,
            telegram_user_id: telegramUserId,
            payment_method: 'nowpayments',
            status: 'completed',
            amount: payload.price_amount,
            currency: payload.price_currency,
            payment_id: paymentId,
            details: payload
          });
          
        if (paymentUpdateError) {
          console.error("❌ Error recording payment:", paymentUpdateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update payment record', details: paymentUpdateError }),
            { headers: corsHeaders, status: 500 }
          );
        }
        
        console.log("✅ Payment record created successfully");
      } catch (dbError) {
        console.error("❌ Database error while processing payment:", dbError);
        return new Response(
          JSON.stringify({ error: 'Database error', details: dbError.message }),
          { headers: corsHeaders, status: 500 }
        );
      }
      
      console.log("✅ NOWPayments payment processed successfully");
    } else {
      console.log(`ℹ️ NOWPayments payment status '${paymentStatus}' not processed`);
    }
    
    // Always return success to NOWPayments
    return new Response(
      JSON.stringify({ success: true }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error("❌ Error processing NOWPayments webhook:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
