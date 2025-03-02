
import React from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import { motion } from "framer-motion";

interface PaymentOptionsProps {
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  stripeConfig: any;
}

export const PaymentOptions = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  stripeConfig
}: PaymentOptionsProps) => {
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
    <motion.div
      className="grid grid-cols-3 gap-4 sm:gap-6 w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <TelegramPaymentOption
          icon="/lovable-uploads/214f6259-adad-480f-81ba-77390e675f8b.png"
          title="💳 PayPal"
          isSelected={selectedPaymentMethod === 'paypal'}
          onSelect={() => onPaymentMethodSelect('paypal')}
        />
      </motion.div>
      
      <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <TelegramPaymentOption
          icon="/lovable-uploads/0f9dcb59-a015-47ed-91ed-0f57d6e2c751.png"
          title="💰 Credit"
          isSelected={selectedPaymentMethod === 'card'}
          onSelect={() => onPaymentMethodSelect('card')}
          disabled={!stripeConfig}
        />
      </motion.div>
      
      <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <TelegramPaymentOption
          icon="/lovable-uploads/c00577e9-67bf-4dcb-b6c9-c821640fcea2.png"
          title="🏦 Transfer"
          isSelected={selectedPaymentMethod === 'bank'}
          onSelect={() => onPaymentMethodSelect('bank')}
        />
      </motion.div>
    </motion.div>
  );
};
