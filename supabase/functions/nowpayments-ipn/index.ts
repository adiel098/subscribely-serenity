
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract request body
    const requestBody = await req.json();
    console.log("NOWPayments IPN webhook received:", requestBody);

    // Basic validation
    if (!requestBody.payment_id || !requestBody.payment_status) {
      return new Response(
        JSON.stringify({ error: "Invalid IPN notification format" }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Find the matching payment in our database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('external_id', requestBody.payment_id)
      .maybeSingle();

    if (paymentError) {
      console.error("Error fetching payment:", paymentError);
      return new Response(
        JSON.stringify({ error: "Database error", details: paymentError.message }),
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    if (!paymentData) {
      console.warn(`Payment with external_id ${requestBody.payment_id} not found in database`);
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { 
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Update payment status based on NOWPayments status
    let status = 'pending';
    if (requestBody.payment_status === 'confirmed' || 
        requestBody.payment_status === 'finished') {
      status = 'completed';
    } else if (requestBody.payment_status === 'failed' || 
               requestBody.payment_status === 'expired') {
      status = 'failed';
    }

    // Update payment in database
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status,
        metadata: {
          ...paymentData.metadata,
          nowpayments: {
            ...paymentData.metadata?.nowpayments,
            ipn_received: true,
            ipn_data: requestBody,
            updated_at: new Date().toISOString()
          }
        }
      })
      .eq('id', paymentData.id)
      .select();

    if (updateError) {
      console.error("Error updating payment:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update payment", details: updateError.message }),
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    console.log("Payment status updated successfully:", {
      payment_id: paymentData.id,
      external_id: requestBody.payment_id,
      old_status: paymentData.status,
      new_status: status
    });

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "IPN processed successfully",
        payment_id: paymentData.id
      }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("IPN webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});
