
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, Heart } from "lucide-react";
import { TelegramPaymentOption } from "@/components/payments/TelegramPaymentOption";
import { Plan } from "../types";
import { SuccessScreen } from "./SuccessScreen";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethodsProps {
  selectedPlan: Plan;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink?: string | null;
  showSuccess: boolean;
}

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess
}: PaymentMethodsProps) => {
  return (
    <div id="payment-methods" className="space-y-4">
      <h2 className="text-xl font-semibold">Select Payment Method</h2>
      <TelegramPaymentOption
        isSelected={selectedPaymentMethod === 'telegram'}
        onSelect={() => onPaymentMethodSelect('telegram')}
      />
    </div>
  );
};
