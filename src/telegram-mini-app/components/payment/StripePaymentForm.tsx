import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';

// This is the form that will be used inside the Elements provider
const CheckoutForm = ({ onSuccess, price }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
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
      console.error('Error confirming payment:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <div className="text-sm text-red-500">
          {errorMessage}
        </div>
      )}
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full"
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
const StripePaymentForm = ({ stripeConfig, onSuccess, price }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        if (!stripeConfig?.public_key) {
          console.error('No Stripe public key found in config:', stripeConfig);
          setError('Payment method not properly configured');
          return;
        }

        console.log('Initializing Stripe with public key...');
        setStripePromise(loadStripe(stripeConfig.public_key));
        
        // Create a payment intent
        console.log('Creating payment intent with amount:', price);
        const { data: intentData, error: intentError } = await supabase.functions.invoke('create-stripe-payment-intent', {
          body: { 
            amount: price,
            config: stripeConfig
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

        setClientSecret(intentData.clientSecret);
      } catch (err) {
        console.error('Error in initializeStripe:', err);
        setError('Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStripe();
  }, [stripeConfig, price]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
        <div className="relative">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <div className="absolute inset-0 animate-pulse opacity-50">
            <Loader2 className="w-8 h-8 text-blue-300" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-blue-700">
            Initializing Payment
          </h3>
          <p className="text-sm text-blue-600/80">
            Please wait while we prepare your secure payment form...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-start space-x-3">
          <div className="mt-0.5">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-800">
              Payment Initialization Failed
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Please try refreshing the page or contact support if the issue persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    return null;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} price={price} />
    </Elements>
  );
};

export default StripePaymentForm;
