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
    // Parse request body
    let params;
    try {
      params = await req.json()
      console.log('Received params:', JSON.stringify(params))
    } catch (e) {
      console.error('Error parsing request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { amount, config } = params
    console.log('Creating payment intent with amount:', amount)

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error('Invalid amount in request:', amount)
      return new Response(
        JSON.stringify({ error: 'Invalid amount parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!config?.secret_key) {
      console.error('Missing Stripe secret key in config:', config)
      return new Response(
        JSON.stringify({ error: 'Payment method not properly configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    try {
      console.log('Initializing Stripe with secret key')
      const stripe = new Stripe(config.secret_key, {
        apiVersion: '2023-10-16',
      });

      const amountInCents = Math.round(amount * 100) // Convert to cents
      console.log(`Creating payment intent for amount: ${amount} (${amountInCents} cents)`)
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log('Payment intent created successfully:', paymentIntent.id)
      
      return new Response(
        JSON.stringify({ clientSecret: paymentIntent.client_secret }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      return new Response(
        JSON.stringify({ error: stripeError.message || 'Error creating payment intent' }),
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
