
import { supabase } from "@/integrations/supabase/client";

/**
 * Handles CoinPayments webhook requests (IPN)
 * @param request The webhook request from CoinPayments
 * @returns Response to send back to CoinPayments
 */
export async function handleCoinPaymentsWebhook(request: Request): Promise<Response> {
  // Forward the request to our Supabase Edge Function
  try {
    // Get the request body and headers
    const body = await request.text();
    const hmacHeader = request.headers.get("HMAC");
    
    // Call our edge function with the request data
    const { data, error } = await supabase.functions.invoke("coinpayments-webhook", {
      body: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "HMAC": hmacHeader || ""
      }
    });
    
    if (error) {
      console.error("Error calling coinpayments-webhook function:", error);
      return new Response("IPN Error", { status: 500 });
    }
    
    return new Response("IPN OK", { status: 200 });
  } catch (err) {
    console.error("Error in handleCoinPaymentsWebhook:", err);
    return new Response("IPN Error", { status: 500 });
  }
}
