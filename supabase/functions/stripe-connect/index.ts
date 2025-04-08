
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Required environment variables:
// - STRIPE_CLIENT_ID: Your Stripe Connect application's client ID
// - SUPABASE_URL: Your Supabase project URL
// - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key
// - FRONTEND_URL: Your frontend application URL (for redirects)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    // Initialize Supabase client with service role key for admin actions
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Handle different actions
    if (action === 'authorize') {
      // Generate the Stripe OAuth URL and redirect the user
      const stripeClientId = Deno.env.get('STRIPE_CLIENT_ID');
      if (!stripeClientId) {
        throw new Error('STRIPE_CLIENT_ID environment variable not set');
      }
      
      const params = new URLSearchParams(url.search);
      const userId = params.get('user_id');
      
      if (!userId) {
        throw new Error('Missing user_id parameter');
      }
      
      // Create a redirect URL to Stripe's OAuth page
      const redirectUri = `${req.headers.get('origin') || Deno.env.get('FRONTEND_URL')}/functions/v1/stripe-connect/callback`;
      const state = userId; // Simply use userId as state, or encrypt it if needed
      
      const stripeAuthorizeUrl = new URL('https://connect.stripe.com/oauth/authorize');
      stripeAuthorizeUrl.searchParams.append('client_id', stripeClientId);
      stripeAuthorizeUrl.searchParams.append('response_type', 'code');
      stripeAuthorizeUrl.searchParams.append('scope', 'read_write');
      stripeAuthorizeUrl.searchParams.append('redirect_uri', redirectUri);
      stripeAuthorizeUrl.searchParams.append('state', state);
      
      return Response.redirect(stripeAuthorizeUrl.toString(), 302);
    } 
    else if (action === 'callback') {
      // Handle the OAuth callback from Stripe
      const params = new URLSearchParams(url.search);
      const code = params.get('code');
      const state = params.get('user_id') || params.get('state'); // Get user_id from state
      
      if (!code) {
        throw new Error('Missing code parameter');
      }
      
      if (!state) {
        throw new Error('Missing state parameter');
      }
      
      // Exchange the authorization code for an access token
      const tokenResponse = await fetch('https://connect.stripe.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_secret: Deno.env.get('STRIPE_SECRET_KEY') || '',
          grant_type: 'authorization_code',
          code
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenData.error) {
        console.error('Error exchanging code for token:', tokenData.error);
        throw new Error(`Stripe error: ${tokenData.error_description || tokenData.error}`);
      }
      
      // Extract the connected account ID and keys
      const { stripe_user_id, access_token, refresh_token } = tokenData;
      
      // Store the connection in the database
      const { error: updateError } = await supabase
        .from('payment_methods')
        .update({
          config: {
            stripe_account_id: stripe_user_id,
            access_token,
            refresh_token,
            connected_at: new Date().toISOString(),
            is_connected: true
          },
          is_active: true
        })
        .eq('owner_id', state)
        .eq('provider', 'stripe');
      
      if (updateError) {
        // If no payment method exists, create one
        const { error: insertError } = await supabase
          .from('payment_methods')
          .insert({
            provider: 'stripe',
            owner_id: state,
            is_active: true,
            config: {
              stripe_account_id: stripe_user_id,
              access_token,
              refresh_token,
              connected_at: new Date().toISOString(),
              is_connected: true
            }
          });
          
        if (insertError) {
          throw new Error(`Database error: ${insertError.message}`);
        }
      }
      
      // Redirect back to the frontend with a success message
      const frontendUrl = Deno.env.get('FRONTEND_URL') || req.headers.get('origin');
      return Response.redirect(`${frontendUrl}/group_owners/settings/payment-methods?success=true&provider=stripe`, 302);
    }
    
    return new Response(JSON.stringify({ error: 'Invalid action' }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
