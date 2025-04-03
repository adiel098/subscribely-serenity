
import React, { useEffect } from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import StripePaymentForm from "./StripePaymentForm";
import CryptoPaymentForm from "./CryptoPaymentForm";
import { motion } from "framer-motion";

interface PaymentOptionsProps {
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  stripeConfig: any;
  communityId: string;
  price: number;
  onPaymentSuccess: () => void;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  planId?: string;
  inviteLink?: string;
}

export const PaymentOptions = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  stripeConfig,
  communityId,
  price,
  onPaymentSuccess,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  planId,
  inviteLink
}: PaymentOptionsProps) => {
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("[PaymentOptions] Rendering with selectedMethod:", selectedPaymentMethod);
    console.log("[PaymentOptions] Community ID:", communityId);
    console.log("[PaymentOptions] Price:", price);
    console.log("[PaymentOptions] Telegram user ID:", telegramUserId);
  }, [selectedPaymentMethod, communityId, price, telegramUserId]);

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
            method="crypto"
            title="Crypto"
            isSelected={selectedPaymentMethod === 'crypto'}
            onSelect={() => handlePaymentMethodSelect('crypto')}
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

      {selectedPaymentMethod === 'crypto' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <CryptoPaymentForm
            communityId={communityId}
            onSuccess={onPaymentSuccess}
            price={price}
            telegramUserId={telegramUserId}
            telegramUsername={telegramUsername}
            firstName={firstName}
            lastName={lastName}
            planId={planId}
            inviteLink={inviteLink}
          />
        </motion.div>
      )}
    </div>
  );
};
