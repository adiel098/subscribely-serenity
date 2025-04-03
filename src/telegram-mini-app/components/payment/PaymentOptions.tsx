
import React, { useEffect, useState } from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import StripePaymentForm from "./StripePaymentForm";
import CryptoPaymentForm from "./CryptoPaymentForm";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CryptoPaymentConfig } from "@/group_owners/components/payments/CryptoPaymentConfig";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

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
  isAdmin?: boolean;
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
  inviteLink,
  isAdmin = false
}: PaymentOptionsProps) => {
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("[PaymentOptions] Rendering with selectedMethod:", selectedPaymentMethod);
    console.log("[PaymentOptions] Community ID:", communityId);
    console.log("[PaymentOptions] Price:", price);
    console.log("[PaymentOptions] Telegram user ID:", telegramUserId);
    console.log("[PaymentOptions] Is Admin:", isAdmin);
  }, [selectedPaymentMethod, communityId, price, telegramUserId, isAdmin]);

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configProvider, setConfigProvider] = useState<string | null>(null);

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

  const handleOpenConfig = (provider: string) => {
    setConfigProvider(provider);
    setIsConfigDialogOpen(true);
  };

  const handleConfigSuccess = () => {
    setIsConfigDialogOpen(false);
    // אפשר גם לטעון מחדש את הנתונים אם צריך
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
          >
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfig('paypal');
                }}
              >
                <Settings size={16} />
              </Button>
            )}
          </TelegramPaymentOption>
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="stripe"
            title="Stripe"
            isSelected={selectedPaymentMethod === 'stripe'}
            onSelect={() => handlePaymentMethodSelect('stripe')}
          >
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfig('stripe');
                }}
              >
                <Settings size={16} />
              </Button>
            )}
          </TelegramPaymentOption>
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="crypto"
            title="Crypto"
            isSelected={selectedPaymentMethod === 'crypto'}
            onSelect={() => handlePaymentMethodSelect('crypto')}
          >
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenConfig('crypto');
                }}
              >
                <Settings size={16} />
              </Button>
            )}
          </TelegramPaymentOption>
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

      {/* דיאלוג הגדרות תשלום */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {configProvider === 'stripe' && 'Stripe Payment Settings'}
              {configProvider === 'paypal' && 'PayPal Payment Settings'}
              {configProvider === 'crypto' && 'Crypto Payment Settings'}
            </DialogTitle>
          </DialogHeader>
          
          {configProvider === 'crypto' && (
            <CryptoPaymentConfig
              ownerId={telegramUserId}
              onSuccess={handleConfigSuccess}
            />
          )}
          
          {/* להוסיף בעתיד תמיכה ב-Stripe ו-PayPal */}
          {configProvider === 'stripe' && (
            <div className="p-4 text-center">
              <p>Stripe payment configuration will be available soon.</p>
            </div>
          )}
          
          {configProvider === 'paypal' && (
            <div className="p-4 text-center">
              <p>PayPal payment configuration will be available soon.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
