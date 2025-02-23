
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banknote, CreditCard, Wallet, ArrowRight } from "lucide-react";
import { Plan } from "@/types/subscription";

interface PaymentMethodsProps {
  selectedPlan: Plan | null;
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  onCompletePurchase: () => void;
  communityInviteLink: string | null;
  showSuccess: boolean;
}

export const PaymentMethodIcon = ({ method }: { method: string }) => {
  switch (method) {
    case "credit_card":
      return <CreditCard className="h-6 w-6 text-gray-500" />;
    case "paypal":
      return <Wallet className="h-6 w-6 text-gray-500" />;
    case "bank_transfer":
      return <Banknote className="h-6 w-6 text-gray-500" />;
    default:
      return null;
  }
};

export const PaymentMethodButton = ({
  method,
  label,
  isSelected,
  onSelect
}: {
  method: string;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div
    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center space-y-2 ${
      isSelected ? 'border-primary shadow-md bg-primary/5' : ''
    }`}
    onClick={onSelect}
  >
    <PaymentMethodIcon method={method} />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export const PaymentMethods = ({
  selectedPlan,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onCompletePurchase,
  communityInviteLink,
  showSuccess,
}: PaymentMethodsProps) => {
  if (showSuccess && communityInviteLink) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-6 rounded-lg bg-green-50 text-green-700">
          <h3 className="text-xl font-semibold mb-2">Payment Successful! 🎉</h3>
          <p>You can now join the community using the invite link below.</p>
        </div>
        <Button 
          className="w-full" 
          onClick={() => window.open(communityInviteLink, '_blank')}
        >
          Join Community <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Choose Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PaymentMethodButton
          method="credit_card"
          label="Credit Card"
          isSelected={selectedPaymentMethod === "credit_card"}
          onSelect={() => onPaymentMethodSelect("credit_card")}
        />
        <PaymentMethodButton
          method="paypal"
          label="PayPal"
          isSelected={selectedPaymentMethod === "paypal"}
          onSelect={() => onPaymentMethodSelect("paypal")}
        />
        <PaymentMethodButton
          method="bank_transfer"
          label="Bank Transfer"
          isSelected={selectedPaymentMethod === "bank_transfer"}
          onSelect={() => onPaymentMethodSelect("bank_transfer")}
        />
      </div>
      {selectedPlan && selectedPaymentMethod && (
        <div className="space-y-4">
          <Badge variant="secondary" className="w-full justify-center py-2">
            Selected: {selectedPlan.name} plan - ${selectedPlan.price}/{selectedPlan.interval}
          </Badge>
          <Button 
            className="w-full"
            onClick={onCompletePurchase}
          >
            Complete Purchase
          </Button>
        </div>
      )}
    </div>
  );
};
