
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
    
    // Get community owner information
    let ownerId;
    
    if (communityId) {
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('owner_id')
        .eq('id', communityId)
        .single();
        
      if (communityError) {
        console.error('Error fetching community data:', communityError);
        return new Response(
          JSON.stringify({ error: 'Community not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      ownerId = communityData.owner_id;
    } else if (groupId) {
      // Similar logic for groups if needed
      // ...
    }
    
    if (!ownerId) {
      return new Response(
        JSON.stringify({ error: 'Could not determine owner ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get payment method for the owner
    const { data: paymentMethod, error: configError } = await supabase
      .from('owner_payment_methods')
      .select('config')
      .eq('provider', 'stripe')
      .eq('is_active', true)
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (configError || !paymentMethod) {
      console.error('Error fetching Stripe config:', configError)
      
      // Try to get a default Stripe configuration
      const { data: defaultMethod, error: defaultError } = await supabase
        .from('owner_payment_methods')
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

    // Check if using Stripe Connect or API keys
    const useConnect = paymentMethod?.config?.stripe_account_id && paymentMethod?.config?.is_connected;
    const stripeAccountId = useConnect ? paymentMethod.config.stripe_account_id : null;
    
    // Get appropriate secret key
    let secretKey;
    
    if (useConnect) {
      // Use platform key for connected accounts
      secretKey = Deno.env.get('STRIPE_SECRET_KEY');
      console.log('Using Stripe Connect with account:', stripeAccountId);
    } else {
      // Use merchant's direct API key
      secretKey = paymentMethod.config?.secret_key;
      console.log('Using direct API key integration');
    }

    if (!secretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe secret key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create metadata with appropriate entity ID
    const metadata: any = { planId };
    if (communityId) metadata.communityId = communityId;
    if (groupId) metadata.groupId = groupId;
    if (telegramUserId) metadata.telegramUserId = telegramUserId;

    // Create Stripe session params
    const sessionParams: any = {
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
    };
    
    // If using Connect, specify the connected account and application fee
    if (stripeAccountId) {
      sessionParams.stripe_account = stripeAccountId;
      
      // Optional: Add platform fee - typically a percentage of the transaction
      // For example, 10% of the transaction amount:
      // const applicationFeeAmount = Math.round(amount * 100 * 0.1); 
      // sessionParams.payment_intent_data = {
      //   application_fee_amount: applicationFeeAmount,
      // };
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create(sessionParams);

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
