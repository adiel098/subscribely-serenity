
import { serve } from "https://deno.land/std@0.180.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import * as crypto from "https://deno.land/std@0.180.0/crypto/mod.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to encode HMAC signature
async function createHmacSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, msgData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper to make CoinPayments API request
async function coinPaymentsApiRequest(
  method: string,
  payload: Record<string, any>,
  apiKey: string,
  apiSecret: string
): Promise<any> {
  try {
    // Add required fields
    const requestPayload = {
      ...payload,
      version: "1",
      key: apiKey,
      cmd: method,
      format: "json",
    };

    // Sort parameters alphabetically as required by CoinPayments
    const sortedPayload = Object.keys(requestPayload)
      .sort()
      .reduce((acc, key) => {
        acc[key] = requestPayload[key];
        return acc;
      }, {} as Record<string, any>);

    // Create the query string
    const queryString = new URLSearchParams(sortedPayload as Record<string, string>).toString();

    // Create HMAC signature
    const hmac = await createHmacSignature(queryString, apiSecret);

    // Make the API request
    const response = await fetch("https://www.coinpayments.net/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "HMAC": hmac,
      },
      body: queryString,
    });

    const data = await response.json();
    
    if (data.error !== "ok") {
      throw new Error(data.error || "Unknown CoinPayments API error");
    }
    
    return data.result;
  } catch (error) {
    console.error("CoinPayments API error:", error);
    throw error;
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

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const requestData = await req.json();
    const { action, merchantId, paymentData, apiKey, apiSecret } = requestData;

    // Validate required parameters
    if (!action) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter: action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CoinPayments API actions
    switch (action) {
      case "create_transaction": {
        // Validate transaction parameters
        const { amount, currency, buyerEmail, itemName, communityId, telegramUserId } = paymentData;
        
        if (!amount || !currency || !communityId) {
          return new Response(
            JSON.stringify({ error: "Missing required payment parameters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create transaction in CoinPayments
        const transactionParams = {
          amount,
          currency1: "USD", // The currency the buyer is paying in
          currency2: currency, // The currency you want to receive
          buyer_email: buyerEmail || "customer@example.com",
          item_name: itemName || `Membership: ${communityId}`,
          custom: JSON.stringify({ communityId, telegramUserId }),
          ipn_url: `${req.headers.get("origin")}/api/coinpayments-webhook`,
        };

        const transaction = await coinPaymentsApiRequest(
          "create_transaction",
          transactionParams,
          apiKey,
          apiSecret
        );

        // Store transaction reference in our database for tracking
        const { error: dbError } = await supabase
          .from("subscription_payments")
          .insert({
            community_id: communityId,
            telegram_user_id: telegramUserId,
            amount: parseFloat(amount),
            payment_method: "crypto",
            status: "pending",
            telegram_username: paymentData.telegramUsername,
            first_name: paymentData.firstName,
            last_name: paymentData.lastName,
            plan_id: paymentData.planId,
            invite_link: paymentData.inviteLink || null
          });

        if (dbError) {
          console.error("Database error:", dbError);
        }

        // Return the transaction details
        return new Response(
          JSON.stringify({ success: true, transaction }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_rates": {
        // Get exchange rates for a specific currency or all currencies
        const rates = await coinPaymentsApiRequest(
          "rates", 
          { accepted: 1 },
          apiKey,
          apiSecret
        );

        return new Response(
          JSON.stringify({ success: true, rates }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "get_tx_info": {
        // Get transaction information
        const { txId } = requestData;
        
        if (!txId) {
          return new Response(
            JSON.stringify({ error: "Missing transaction ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const txInfo = await coinPaymentsApiRequest(
          "get_tx_info",
          { txid: txId },
          apiKey,
          apiSecret
        );

        return new Response(
          JSON.stringify({ success: true, txInfo }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unsupported action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
