
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
    const { planId, amount, communityId, groupId, telegramUserId } = await req.json()
    console.log('Creating Stripe session with params:', { planId, amount, communityId, groupId, telegramUserId })

    if (!communityId && !groupId) {
      return new Response(
        JSON.stringify({ error: 'Missing communityId or groupId parameter' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      )
    }

    // Prepare query to get Stripe config
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

    if (configError || !paymentMethod?.config?.secret_key) {
      console.error('Error fetching Stripe config:', configError)
      
      // Try to get a default Stripe configuration
      const { data: defaultMethod, error: defaultError } = await supabase
        .from('payment_methods')
        .select('config')
        .eq('provider', 'stripe')
        .eq('is_default', true)
        .eq('is_active', true)
        .single();
        
      if (defaultError || !defaultMethod?.config?.secret_key) {
        return new Response(
          JSON.stringify({ error: 'Stripe configuration not found' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        )
      }
      
      // Use the default payment method
      console.log('Using default Stripe configuration');
      paymentMethod = defaultMethod;
    }

    const stripe = new Stripe(paymentMethod.config.secret_key, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create metadata with appropriate entity ID
    const metadata: any = { planId };
    if (communityId) metadata.communityId = communityId;
    if (groupId) metadata.groupId = groupId;
    if (telegramUserId) metadata.telegramUserId = telegramUserId;

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Subscription Plan',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancel`,
      metadata,
    })

    console.log('Created Stripe session:', session.id)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating Stripe session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
