
import React, { useEffect, useState } from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import StripePaymentForm from "./StripePaymentForm";
import { motion } from "framer-motion";
import { NOWPaymentsButton } from "./NOWPaymentsButton";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("[PaymentOptions] Rendering with selectedMethod:", selectedPaymentMethod);
    console.log("[PaymentOptions] Community ID:", communityId);
    console.log("[PaymentOptions] Price:", price);
  }, [selectedPaymentMethod, communityId, price]);

  // Fetch NOWPayments config when needed
  useEffect(() => {
    const fetchNowPaymentsConfig = async () => {
      if (selectedPaymentMethod === 'nowpayments') {
        setIsLoadingConfig(true);
        try {
          // Note: We're using 'crypto' as the provider name in the database
          const { data, error } = await supabase
            .from('payment_methods')
            .select('config')
            .eq('provider', 'crypto')
            .eq('is_active', true)
            .maybeSingle();
            
          if (error) throw error;
          console.log("[PaymentOptions] NOWPayments config:", data?.config);
          setNowPaymentsConfig(data?.config || {});
        } catch (err) {
          console.error("[PaymentOptions] Error fetching NOWPayments config:", err);
        } finally {
          setIsLoadingConfig(false);
        }
      }
    };
    
    fetchNowPaymentsConfig();
  }, [selectedPaymentMethod]);

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
    // Store payment data in local storage for retrieval after redirect
    localStorage.setItem('nowpayments_transaction', JSON.stringify({
      paymentId: paymentData.payment_id,
      status: paymentData.payment_status,
      amount: paymentData.price_amount,
      timestamp: Date.now()
    }));
    
    // We'll trigger success when the user returns from the payment page
    // or when they refresh and we detect the completed transaction
  };

  useEffect(() => {
    // Check for returning NOWPayments transaction
    const checkStoredTransaction = async () => {
      const storedTransaction = localStorage.getItem('nowpayments_transaction');
      if (storedTransaction) {
        try {
          const transaction = JSON.parse(storedTransaction);
          console.log("[PaymentOptions] Found stored NOWPayments transaction:", transaction);
          
          // If transaction is older than 1 hour, remove it
          if (Date.now() - transaction.timestamp > 3600000) {
            localStorage.removeItem('nowpayments_transaction');
            return;
          }
          
          // TODO: Check payment status with the backend
          // For now, we'll just trigger success if the user has an active transaction
          onPaymentSuccess();
          
          // Clear stored transaction after success
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
            <NOWPaymentsButton
              amount={price}
              apiKey={nowPaymentsConfig?.api_key || ''}
              ipnCallbackUrl={nowPaymentsConfig?.ipn_callback_url}
              orderId={`telegram-${communityId}-${Date.now()}`}
              description={`Telegram Group Subscription - $${price}`}
              onSuccess={handleNOWPaymentsSuccess}
              onError={(error) => console.error("[PaymentOptions] NOWPayments error:", error)}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};
