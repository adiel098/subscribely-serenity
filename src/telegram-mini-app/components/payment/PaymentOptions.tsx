
import React from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";

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
  return (
    <div className="grid grid-cols-3 gap-6">
      <TelegramPaymentOption
        icon="/lovable-uploads/214f6259-adad-480f-81ba-77390e675f8b.png"
        title="PayPal"
        isSelected={selectedPaymentMethod === 'paypal'}
        onSelect={() => onPaymentMethodSelect('paypal')}
      />
      <TelegramPaymentOption
        icon="/lovable-uploads/0f9dcb59-a015-47ed-91ed-0f57d6e2c751.png"
        title="Card"
        isSelected={selectedPaymentMethod === 'card'}
        onSelect={() => onPaymentMethodSelect('card')}
        disabled={!stripeConfig}
      />
      <TelegramPaymentOption
        icon="/lovable-uploads/c00577e9-67bf-4dcb-b6c9-c821640fcea2.png"
        title="Bank Transfer"
        isSelected={selectedPaymentMethod === 'bank'}
        onSelect={() => onPaymentMethodSelect('bank')}
      />
    </div>
  );
};
