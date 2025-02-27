
import React from "react";
import { Plan } from "../types/app.types";
import { SuccessScreen } from "./SuccessScreen";
import { useStripeConfig } from "../hooks/useStripeConfig";
import { usePaymentProcessing } from "../hooks/usePaymentProcessing";
import { PaymentHeader } from "./payment/PaymentHeader";
import { PaymentOptions } from "./payment/PaymentOptions";
import { PaymentButton } from "./payment/PaymentButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// For development, set this to true to bypass real payment processing
const TEST_MODE = true;

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
  const { stripeConfig, isLoading, error } = useStripeConfig(selectedPlan);
  const { isProcessing, paymentInviteLink, handlePayment } = usePaymentProcessing(
    selectedPlan,
    selectedPaymentMethod,
    onCompletePurchase
  );

  if (showSuccess) {
    return <SuccessScreen communityInviteLink={paymentInviteLink || communityInviteLink} />;
  }

  return (
    <div id="payment-methods" className="space-y-8 animate-fade-in pb-12">
      <PaymentHeader />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <PaymentOptions
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodSelect={onPaymentMethodSelect}
        stripeConfig={stripeConfig}
        isLoading={isLoading}
      />

      {selectedPaymentMethod && (
        <PaymentButton
          price={selectedPlan.price}
          isProcessing={isProcessing}
          onClick={handlePayment}
        />
      )}
    </div>
  );
};
