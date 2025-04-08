
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
    
    // Log the full request for debugging
    console.log("📡 Request method:", req.method);
    console.log("📡 Request headers:", [...req.headers.entries()]);
    
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
      console.warn("⚠️ Missing signature header in NOWPayments request. Proceeding anyway for testing purposes.");
    } else {
      console.log("✅ Signature header found:", signature);
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
    
    // רישום התשלום בטבלת התשלומים
    try {
      // Check payment status - support both invoice and payment webhooks
      // Invoice webhook uses 'payment_status', payment webhook uses 'status'
      const paymentStatus = payload.payment_status || payload.status;
      console.log("💰 Payment status:", paymentStatus);
      
      // רישום התשלום תמיד, ללא קשר לסטטוס
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .upsert({
          community_id: communityId,
          user_id: telegramUserId,
          amount: payload.price_amount,
          currency: payload.price_currency,
          payment_method: 'nowpayments',
          external_id: payload.payment_id || payload.id,
          status: ['finished', 'confirmed', 'completed'].includes(paymentStatus) ? 'completed' : 
                 ['failed', 'expired', 'cancelled'].includes(paymentStatus) ? 'failed' : 'pending',
          metadata: {
            nowpayments: payload,
            payment_method: 'crypto',
            payment_provider: 'nowpayments',
            webhook_received_at: new Date().toISOString()
          }
        }, {
          onConflict: 'external_id'
        })
        .select('id, status');
        
      if (paymentError) {
        console.error("❌ Error recording payment:", paymentError);
        throw new Error(`Database error: ${paymentError.message}`);
      }
      
      console.log("✅ Payment record created/updated successfully:", paymentData);
      
      // Only process if payment is finished, confirmed, or completed
      if (['finished', 'confirmed', 'completed'].includes(paymentStatus)) {
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
              subscription_plan_id: payload.subscription_plan_id || null,
              payment_id: paymentData?.[0]?.id
            });
            
          if (subscriptionError) {
            console.error("❌ Error creating subscription:", subscriptionError);
            throw new Error(`Subscription error: ${subscriptionError.message}`);
          }
          
          console.log("✅ Subscription created/updated successfully");
          
          // Create payment record for successful payments
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
            console.error("❌ Error recording payment details:", paymentUpdateError);
            throw new Error(`Payment record error: ${paymentUpdateError.message}`);
          }
          
          console.log("✅ Payment record created successfully");
          
          // חיפוש לינק הזמנה קיים
          try {
            const { data: inviteData, error: inviteError } = await supabase
              .from('communities')
              .select('invite_link')
              .eq('id', communityId)
              .single();
              
            if (!inviteError && inviteData?.invite_link) {
              console.log("✅ Found existing invite link:", inviteData.invite_link);
              
              // עדכון התשלום עם לינק ההזמנה
              await supabase
                .from('subscription_payments')
                .update({
                  invite_link: inviteData.invite_link
                })
                .eq('payment_id', paymentId);
            } else {
              console.warn("⚠️ No invite link found, will not attempt to create one in webhook");
            }
          } catch (inviteSearchError) {
            console.error("❌ Error searching for invite link:", inviteSearchError);
          }
        } catch (dbError) {
          console.error("❌ Database error while processing payment:", dbError);
          throw new Error(`Database operation failed: ${dbError.message}`);
        }
        
        console.log("✅ NOWPayments payment processed successfully");
      } else {
        console.log(`ℹ️ NOWPayments payment status '${paymentStatus}' not fully processed`);
      }
    } catch (processingError) {
      console.error("❌ Error in payment processing:", processingError);
      return new Response(
        JSON.stringify({ 
          error: 'Payment processing error', 
          details: processingError.message 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    // Always return success to NOWPayments
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "IPN received and processed",
        processedAt: new Date().toISOString()
      }),
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
