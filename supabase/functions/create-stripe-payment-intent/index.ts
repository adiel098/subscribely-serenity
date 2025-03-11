
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    let params;
    try {
      params = await req.json()
    } catch (e) {
      console.error('Error parsing request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { communityId, groupId, amount } = params
    console.log('Creating Stripe payment intent with params:', { communityId, groupId, amount })

    if (!communityId && !groupId) {
      console.error('Missing entity ID in request')
      return new Response(
        JSON.stringify({ error: 'Missing communityId or groupId parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount in request:', amount)
      return new Response(
        JSON.stringify({ error: 'Invalid amount parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Prepare the query to get the Stripe configuration
    let query = supabase
      .from('payment_methods')
      .select('config')
      .eq('provider', 'stripe')
      .eq('is_active', true);
      
    // Filter by either community or group ID
    if (communityId) {
      query = query.eq('community_id', communityId);
    } else if (groupId) {
      query = query.eq('group_id', groupId);
    }
    
    const { data: paymentMethod, error: configError } = await query.single();

    console.log('Stripe config query result:', paymentMethod, configError)

    if (configError) {
      console.error('Error fetching Stripe config:', configError)
      
      // Try to get a default Stripe configuration
      const { data: defaultMethod, error: defaultError } = await supabase
        .from('payment_methods')
        .select('config')
        .eq('provider', 'stripe')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();
        
      if (defaultError || !defaultMethod) {
        return new Response(
          JSON.stringify({ error: 'Stripe configuration not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // Use the default payment method
      console.log('Using default Stripe configuration')
      paymentMethod = defaultMethod;
    }

    if (!paymentMethod?.config?.secret_key) {
      console.error('No Stripe secret key found in config:', paymentMethod)
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const secretKey = paymentMethod.config.secret_key;

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create payment intent
    try {
      const amountInCents = Math.round(amount * 100) // Convert to cents
      console.log(`Creating payment intent for amount: ${amount} (${amountInCents} cents)`)
      
      const metadata: any = {};
      if (communityId) metadata.communityId = communityId;
      if (groupId) metadata.groupId = groupId;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata
      })

      console.log('Created payment intent:', paymentIntent.id)

      return new Response(
        JSON.stringify({ clientSecret: paymentIntent.client_secret }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError)
      return new Response(
        JSON.stringify({ 
          error: stripeError.message || 'Error creating payment intent',
          stripeError: stripeError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

  } catch (error) {
    console.error('Unexpected error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
