import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import { Plan } from "@/types/subscription";

interface PaymentMethodsProps {
  selectedPlan: Plan | null;
  onSelect: (method: string) => void;
}

export const PaymentMethods = ({ selectedPlan, onSelect }: PaymentMethodsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Choose Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center space-y-2"
          onClick={() => onSelect("credit_card")}
        >
          <CreditCard className="h-6 w-6 text-gray-500" />
          <span className="text-sm font-medium">Credit Card</span>
        </div>
        <div
          className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center space-y-2"
          onClick={() => onSelect("paypal")}
        >
          <Wallet className="h-6 w-6 text-gray-500" />
          <span className="text-sm font-medium">PayPal</span>
        </div>
        <div
          className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center space-y-2"
          onClick={() => onSelect("bank_transfer")}
        >
          <Banknote className="h-6 w-6 text-gray-500" />
          <span className="text-sm font-medium">Bank Transfer</span>
        </div>
      </div>
      {selectedPlan && (
        <div className="text-center">
          <Badge variant="secondary">
            You have selected the {selectedPlan.name} plan
          </Badge>
        </div>
      )}
    </div>
  );
};
