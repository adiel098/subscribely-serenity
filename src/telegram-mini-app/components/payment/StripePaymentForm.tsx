
import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// This is the form that will be used inside the Elements provider
const CheckoutForm = ({ onSuccess, price }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        toast({
          title: 'Payment Error',
          description: error.message || 'An error occurred during payment processing.',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment Successful',
          description: 'Your payment was processed successfully!',
        });
        onSuccess();
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-sm font-medium text-destructive">{errorMessage}</div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${price}`
        )}
      </Button>
    </form>
  );
};

// The main component that loads Stripe and renders the form
const StripePaymentForm = ({ communityId, onSuccess, price }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStripeConfig = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        console.log('Fetching Stripe config for community:', communityId);
        
        // Fetch the Stripe public key from the payment_methods table
        const { data, error } = await supabase
          .from('payment_methods')
          .select('config')
          .eq('community_id', communityId)
          .eq('provider', 'stripe')
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching Stripe config:', error);
          setError('Unable to load payment configuration');
          return;
        }

        if (!data?.config?.public_key) {
          console.error('No Stripe public key found in config:', data);
          setError('Payment method not properly configured');
          return;
        }

        console.log('Found Stripe public key, initializing Stripe...');
        
        // Initialize Stripe with the public key
        setStripePromise(loadStripe(data.config.public_key));
        
        // Create a payment intent
        console.log('Creating payment intent with params:', { communityId, amount: price });
        const { data: intentData, error: intentError } = await supabase.functions.invoke('create-stripe-payment-intent', {
          body: { 
            communityId,
            amount: price
          }
        });

        console.log('Payment intent response:', intentData, intentError);

        if (intentError) {
          console.error('Error creating payment intent:', intentError);
          setError('Unable to initialize payment');
          return;
        }

        if (!intentData?.clientSecret) {
          console.error('No client secret returned from payment intent:', intentData);
          setError('Unable to initialize payment');
          return;
        }

        console.log('Payment intent created successfully');
        setClientSecret(intentData.clientSecret);
      } catch (err) {
        console.error('Unexpected error in fetchStripeConfig:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchStripeConfig();
    }
  }, [communityId, price]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Initializing payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <div className="text-sm font-medium text-destructive">{error}</div>
        <p className="mt-2 text-xs text-muted-foreground">
          Please try another payment method or contact support.
        </p>
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <div className="rounded-md bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Payment configuration incomplete. Please try another method.
        </p>
      </div>
    );
  }

  console.log('Rendering Stripe Elements with client secret');
  return (
    <div className="w-full max-w-md mx-auto">
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm onSuccess={onSuccess} price={price} />
      </Elements>
    </div>
  );
};

export default StripePaymentForm;
