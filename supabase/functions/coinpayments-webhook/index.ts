
import { serve } from "https://deno.land/std@0.180.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import * as crypto from "https://deno.land/std@0.180.0/crypto/mod.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// IPN verification function
async function verifyIpnRequest(body: string, hmacSignature: string, ipnSecret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(ipnSecret);
    const msgData = encoder.encode(body);
    
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["verify"]
    );
    
    // Convert hmacSignature from hex to Uint8Array
    const signatureBytes = new Uint8Array(
      hmacSignature.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      msgData
    );
    
    return isValid;
  } catch (error) {
    console.error("Error verifying IPN signature:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body as text
    const bodyText = await req.text();
    
    // Log the raw IPN data for debugging
    console.log("Received CoinPayments IPN:", bodyText);
    
    // Parse the form data
    const formData = new URLSearchParams(bodyText);
    const ipnData: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      ipnData[key] = value;
    }
    
    // Extract important data
    const merchantId = ipnData.merchant || "";
    const ipnType = ipnData.ipn_type || "";
    const hmacSignature = req.headers.get("HMAC") || "";
    const txnId = ipnData.txn_id || "";
    const status = parseInt(ipnData.status || "0");
    const statusText = ipnData.status_text || "";
    const amount = parseFloat(ipnData.amount || "0");
    const currency = ipnData.currency || "";
    
    // Only process payment IPNs
    if (ipnType !== "api" && ipnType !== "button") {
      return new Response("IPN Received (not a payment)", { status: 200, headers: corsHeaders });
    }
    
    // Get custom data from the transaction (contains communityId and telegramUserId)
    let customData: any = {};
    try {
      if (ipnData.custom) {
        customData = JSON.parse(ipnData.custom);
      }
    } catch (e) {
      console.error("Error parsing custom data:", e);
    }
    
    const communityId = customData.communityId || "";
    const telegramUserId = customData.telegramUserId || "";
    
    // Fetch this merchant's IPN secret and verify the request
    const { data: merchantData, error: merchantError } = await supabase
      .from("payment_methods")
      .select("config")
      .eq("provider", "crypto")
      .eq("config->provider_type", "coinpayments")
      .eq("config->merchant_id", merchantId)
      .single();
    
    if (merchantError || !merchantData) {
      console.error(`Merchant not found: ${merchantId}`, merchantError);
      return new Response("IPN Merchant not found", { status: 400, headers: corsHeaders });
    }
    
    // Verify IPN with merchant's secret key
    const ipnSecret = merchantData.config?.ipn_secret || "";
    const isValid = await verifyIpnRequest(bodyText, hmacSignature, ipnSecret);
    
    if (!isValid) {
      console.error("Invalid IPN signature");
      return new Response("IPN Signature Invalid", { status: 401, headers: corsHeaders });
    }
    
    console.log(`Valid IPN for transaction ${txnId}, status: ${status} (${statusText})`);
    
    // CoinPayments status codes:
    // -1 = cancellation
    // 0 = waiting for funds
    // 1 = confirming transaction
    // 2 = transaction confirmed
    // 100 = complete
    
    // Process the payment based on status
    if (status >= 100 || status === 2) {
      // Payment is complete or confirmed - update our database
      console.log(`Payment complete for transaction ${txnId}`);
      
      // Find any pending payment records for this user and community
      const { data: pendingPayment, error: paymentError } = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("community_id", communityId)
        .eq("telegram_user_id", telegramUserId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (paymentError || !pendingPayment) {
        console.error("No pending payment found:", paymentError);
        // Create a new payment record
        const { error: newPaymentError } = await supabase
          .from("subscription_payments")
          .insert({
            community_id: communityId,
            telegram_user_id: telegramUserId,
            amount,
            payment_method: "crypto",
            status: "completed",
          });
        
        if (newPaymentError) {
          console.error("Error creating new payment record:", newPaymentError);
        }
      } else {
        // Update the pending payment to completed
        const { error: updateError } = await supabase
          .from("subscription_payments")
          .update({
            status: "completed",
          })
          .eq("id", pendingPayment.id);
        
        if (updateError) {
          console.error("Error updating payment status:", updateError);
        } else {
          // Now process the membership
          const planId = pendingPayment.plan_id;
          
          if (planId && telegramUserId) {
            // Get plan details to calculate subscription end date
            const { data: plan } = await supabase
              .from("subscription_plans")
              .select("*")
              .eq("id", planId)
              .single();
            
            if (plan) {
              const now = new Date();
              let endDate = new Date(now);
              
              // Calculate subscription end date based on plan interval
              switch (plan.interval) {
                case "monthly":
                  endDate.setMonth(endDate.getMonth() + 1);
                  break;
                case "quarterly":
                  endDate.setMonth(endDate.getMonth() + 3);
                  break;
                case "half-yearly":
                  endDate.setMonth(endDate.getMonth() + 6);
                  break;
                case "yearly":
                  endDate.setFullYear(endDate.getFullYear() + 1);
                  break;
                case "lifetime":
                  endDate.setFullYear(endDate.getFullYear() + 100);
                  break;
                default:
                  endDate.setMonth(endDate.getMonth() + 1);
              }
              
              // Check if the user is already a member
              const { data: existingMember } = await supabase
                .from("community_subscribers")
                .select("*")
                .eq("telegram_user_id", telegramUserId)
                .eq("community_id", communityId)
                .single();
              
              if (existingMember) {
                // Update existing member
                await supabase
                  .from("community_subscribers")
                  .update({
                    subscription_status: "active",
                    is_active: true,
                    subscription_start_date: now.toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    subscription_plan_id: planId
                  })
                  .eq("id", existingMember.id);
              } else {
                // Create new member
                await supabase
                  .from("community_subscribers")
                  .insert({
                    telegram_user_id: telegramUserId,
                    community_id: communityId,
                    subscription_status: "active",
                    is_active: true,
                    subscription_start_date: now.toISOString(),
                    subscription_end_date: endDate.toISOString(),
                    subscription_plan_id: planId
                  });
              }
              
              // Log the subscription activity
              await supabase
                .from("subscription_activity_logs")
                .insert({
                  telegram_user_id: telegramUserId,
                  community_id: communityId,
                  activity_type: "payment_received",
                  details: `Payment received via Crypto (CoinPayments)`,
                  status: "active"
                });
            }
          }
        }
      }
    } else if (status < 0) {
      // Payment was cancelled or failed
      console.log(`Payment cancelled/failed for transaction ${txnId}`);
      
      // Update any pending payments to failed
      const { error: updateError } = await supabase
        .from("subscription_payments")
        .update({
          status: "failed",
        })
        .eq("community_id", communityId)
        .eq("telegram_user_id", telegramUserId)
        .eq("status", "pending");
      
      if (updateError) {
        console.error("Error updating payment status to failed:", updateError);
      }
    } else {
      // Payment is in progress (waiting/confirming)
      console.log(`Payment in progress for transaction ${txnId}, status: ${status}`);
    }
    
    // Return success to CoinPayments
    return new Response("IPN OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error processing IPN:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
