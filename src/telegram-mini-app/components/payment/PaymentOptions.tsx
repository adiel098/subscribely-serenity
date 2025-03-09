
import React, { useEffect } from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import StripePaymentForm from "./StripePaymentForm";
import { motion } from "framer-motion";

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
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("PaymentOptions render with selectedMethod:", selectedPaymentMethod);
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

  return (
    <div className="space-y-8">
      <motion.div
        className="grid grid-cols-3 gap-4 px-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="paypal"
            title="PayPal"
            isSelected={selectedPaymentMethod === 'paypal'}
            onSelect={() => {
              console.log("PayPal payment method selected");
              onPaymentMethodSelect('paypal');
            }}
          />
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="stripe"
            title="Stripe"
            isSelected={selectedPaymentMethod === 'stripe'}
            onSelect={() => {
              console.log("Stripe payment method selected");
              onPaymentMethodSelect('stripe');
            }}
          />
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="crypto"
            title="Crypto"
            isSelected={selectedPaymentMethod === 'crypto'}
            onSelect={() => {
              console.log("Crypto payment method selected");
              onPaymentMethodSelect('crypto');
            }}
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
    </div>
  );
};
