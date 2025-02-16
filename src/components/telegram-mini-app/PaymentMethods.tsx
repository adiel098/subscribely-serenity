
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Heart } from "lucide-react";
import { TelegramPaymentOption } from "@/components/payments/TelegramPaymentOption";
import { Plan } from "@/pages/TelegramMiniApp";

interface PaymentMethodsProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase
}: PaymentMethodsProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="px-4 py-1.5">
          <Gift className="h-4 w-4 mr-2" />
          Final Step
        </Badge>
        <h2 className="text-3xl font-bold text-gray-900">Choose Payment Method</h2>
        <p className="text-gray-600">
          Select your preferred way to pay for the {selectedPlan.name} plan
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <TelegramPaymentOption
          icon="/lovable-uploads/5a20d054-33f7-43c0-8b20-079ddd9a5dd3.png"
          title="Bitcoin"
          isSelected={selectedPaymentMethod === 'crypto'}
          onSelect={() => onPaymentMethodSelect('crypto')}
        />
        <TelegramPaymentOption
          icon="/lovable-uploads/5bcfd1e4-b3f3-47a5-a50c-bf9e2b7f73a0.png"
          title="Discord Pay"
          isSelected={selectedPaymentMethod === 'discord'}
          onSelect={() => onPaymentMethodSelect('discord')}
        />
        <TelegramPaymentOption
          icon="/lovable-uploads/5763dacb-9a17-4a52-8be0-a56b994b6c44.png"
          title="PayPal"
          isSelected={selectedPaymentMethod === 'paypal'}
          onSelect={() => onPaymentMethodSelect('paypal')}
        />
      </div>

      {selectedPaymentMethod && (
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold gap-2 w-full max-w-sm"
            onClick={onCompletePurchase}
          >
            <Heart className="h-5 w-5" />
            I Paid ${selectedPlan.price}
          </Button>
          <p className="text-sm text-muted-foreground">
            Click the button above after completing your payment
          </p>
        </div>
      )}
    </div>
  );
};
