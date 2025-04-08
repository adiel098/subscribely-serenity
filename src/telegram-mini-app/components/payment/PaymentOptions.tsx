
import React, { useEffect, useState } from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import StripePaymentForm from "./StripePaymentForm";
import { motion } from "framer-motion";
import { NOWPaymentsButton } from "./NOWPaymentsButton";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, User } from "lucide-react";

interface PaymentOptionsProps {
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  stripeConfig: any;
  communityId: string;
  price: number;
  onPaymentSuccess: () => void;
}

export const PaymentOptions = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  stripeConfig,
  communityId,
  price,
  onPaymentSuccess
}: PaymentOptionsProps) => {
  const [nowPaymentsConfig, setNowPaymentsConfig] = useState<any>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [communityOwnerId, setCommunityOwnerId] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("[PaymentOptions] Rendering with selectedMethod:", selectedPaymentMethod);
    console.log("[PaymentOptions] Community ID:", communityId);
    console.log("[PaymentOptions] Price:", price);
  }, [selectedPaymentMethod, communityId, price]);

  useEffect(() => {
    const fetchNowPaymentsConfig = async () => {
      if (selectedPaymentMethod === 'nowpayments') {
        setIsLoadingConfig(true);
        setConfigError(null);
        try {
          const { data: communityData, error: communityError } = await supabase
            .from('communities')
            .select('owner_id')
            .eq('id', communityId)
            .single();
            
          if (communityError) {
            throw new Error(`Could not find community: ${communityError.message}`);
          }
          
          if (!communityData?.owner_id) {
            throw new Error('Community has no owner');
          }
          
          setCommunityOwnerId(communityData.owner_id);
          console.log("[PaymentOptions] Found community owner ID:", communityData.owner_id);
          
          // Updated query: explicitly checking for 'crypto' provider (not 'nowpayments')
          const { data, error } = await supabase
            .from('payment_methods')
            .select('config')
            .eq('provider', 'crypto')
            .eq('is_active', true)
            .eq('owner_id', communityData.owner_id)
            .maybeSingle();
            
          if (error) {
            throw error;
          }
          
          // Log the retrieved data for debugging
          console.log("[PaymentOptions] Retrieved payment method:", data);
          
          if (!data || !data.config || !data.config.api_key) {
            setConfigError("NOWPayments API key is not configured in the database");
            console.error("[PaymentOptions] NOWPayments config missing or invalid:", data);
          } else {
            console.log("[PaymentOptions] NOWPayments config loaded successfully");
          }
          
          setNowPaymentsConfig(data?.config || {});
        } catch (err) {
          console.error("[PaymentOptions] Error fetching NOWPayments config:", err);
          setConfigError(`Failed to load payment configuration: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setIsLoadingConfig(false);
        }
      }
    };
    
    fetchNowPaymentsConfig();
  }, [selectedPaymentMethod, communityId]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handlePaymentMethodSelect = (method: string) => {
    console.log(`[PaymentOptions] Payment method selected: ${method}`);
    onPaymentMethodSelect(method);
  };
  
  const handleNOWPaymentsSuccess = (paymentData: any) => {
    console.log("[PaymentOptions] NOWPayments payment initiated:", paymentData);
    // We'll trigger success when the user returns from the payment page
    // or when they refresh and we detect the completed transaction
  };

  useEffect(() => {
    const checkStoredTransaction = async () => {
      const storedTransaction = localStorage.getItem('nowpayments_transaction');
      if (storedTransaction) {
        try {
          const transaction = JSON.parse(storedTransaction);
          console.log("[PaymentOptions] Found stored NOWPayments transaction:", transaction);
          
          if (Date.now() - transaction.timestamp > 3600000) {
            localStorage.removeItem('nowpayments_transaction');
            return;
          }
          
          onPaymentSuccess();
          
          localStorage.removeItem('nowpayments_transaction');
        } catch (error) {
          console.error("[PaymentOptions] Error checking stored transaction:", error);
          localStorage.removeItem('nowpayments_transaction');
        }
      }
    };
    
    checkStoredTransaction();
  }, [onPaymentSuccess]);

  return (
    <div className="space-y-8">
      <motion.div
        className="grid grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="paypal"
            title="PayPal"
            isSelected={selectedPaymentMethod === 'paypal'}
            onSelect={() => handlePaymentMethodSelect('paypal')}
          />
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="stripe"
            title="Stripe"
            isSelected={selectedPaymentMethod === 'stripe'}
            onSelect={() => handlePaymentMethodSelect('stripe')}
          />
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="nowpayments"
            title="NOWPayments"
            isSelected={selectedPaymentMethod === 'nowpayments'}
            onSelect={() => handlePaymentMethodSelect('nowpayments')}
          />
        </motion.div>
      </motion.div>

      {selectedPaymentMethod === 'stripe' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <StripePaymentForm
            communityId={communityId}
            onSuccess={onPaymentSuccess}
            price={price}
          />
        </motion.div>
      )}
      
      {selectedPaymentMethod === 'nowpayments' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <div className="rounded-lg border p-4 bg-amber-50 border-amber-100">
            <h3 className="text-lg font-semibold mb-3">Crypto Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pay with your preferred cryptocurrency. You'll be redirected to a secure payment page.
            </p>
            
            {isLoadingConfig && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600 mr-2" /> 
                <span>Loading payment configuration...</span>
              </div>
            )}
            
            {configError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700">Configuration Error</p>
                    <p className="text-red-600">{configError}</p>
                    <p className="mt-1 text-gray-700">
                      This payment method is not yet fully set up. Please try another payment option or contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <NOWPaymentsButton
              amount={price}
              apiKey={nowPaymentsConfig?.api_key || ''}
              ipnCallbackUrl={nowPaymentsConfig?.ipn_callback_url}
              orderId={`telegram-${communityId}-${Date.now()}`}
              description={`Telegram Group Subscription - $${price}`}
              onSuccess={handleNOWPaymentsSuccess}
              onError={(error) => {
                console.error("[PaymentOptions] NOWPayments error:", error);
                setConfigError(error);
              }}
            />
            
            <div className="mt-4 p-2 bg-gray-100 rounded-lg border border-gray-300">
              <h4 className="font-bold text-sm flex items-center mb-1">
                <span className="mr-1">🔍</span> Config Debug:
              </h4>
              
              {communityOwnerId && (
                <div className="bg-indigo-50 p-2 rounded-md border border-indigo-100 mb-2">
                  <div className="flex items-center text-indigo-800 font-medium">
                    <User className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                    <span>Owner ID:</span>
                  </div>
                  <div className="font-mono text-xs bg-white/70 px-1.5 py-0.5 rounded mt-0.5 text-indigo-900 border border-indigo-50 break-all">
                    {communityOwnerId}
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <p className="flex items-center">
                  <strong>API Key Present:</strong> 
                  <span className="ml-1">{nowPaymentsConfig?.api_key ? '✅ Yes' : '❌ No'}</span>
                </p>
                <p><strong>IPN URL Configured:</strong> {nowPaymentsConfig?.ipn_callback_url ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Community ID:</strong> {communityId}</p>
                <p><strong>Price:</strong> {price} USD</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
