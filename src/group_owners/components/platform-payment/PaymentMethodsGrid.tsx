
import React from "react";
import { CreditCard, Wallet, Bitcoin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PaymentMethod } from "@/group_owners/hooks/types/subscription.types";

interface PaymentMethodsGridProps {
  paymentMethods: PaymentMethod[] | null;
  isLoading: boolean;
  selectedPlanPrice?: number;
  isProcessing?: boolean;
  onSelectPaymentMethod: (method: string) => void;
  selectedPaymentMethod: string | null;
}

export const PaymentMethodsGrid: React.FC<PaymentMethodsGridProps> = ({
  paymentMethods,
  isLoading,
  selectedPlanPrice = 0,
  isProcessing = false,
  onSelectPaymentMethod,
  selectedPaymentMethod
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="ml-2">Loading payment methods...</span>
      </div>
    );
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-gray-500">No active payment methods available.</p>
        <p className="text-gray-400 text-sm mt-1">
          Please configure payment methods first.
        </p>
      </div>
    );
  }

  const getPaymentIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return <CreditCard className="h-5 w-5 text-indigo-600" />;
      case 'paypal':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'crypto':
        return <Bitcoin className="h-5 w-5 text-amber-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPaymentMethodTitle = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return "Credit Card";
      case 'paypal':
        return "PayPal";
      case 'crypto':
        return "Cryptocurrency";
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  const getPaymentMethodImage = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return "/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png";
      case 'paypal':
        return "/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png";
      case 'crypto':
        return "/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png";
      default:
        return "";
    }
  };

  const activePaymentMethods = paymentMethods.filter(method => method.is_active);

  if (activePaymentMethods.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-gray-500">No active payment methods available.</p>
        <p className="text-gray-400 text-sm mt-1">
          Please enable payment methods first.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {activePaymentMethods.map((method) => (
        <Card
          key={method.id}
          className={`border p-4 rounded-lg cursor-pointer transition-all overflow-hidden ${
            selectedPaymentMethod === method.provider
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
          }`}
          onClick={() => !isProcessing && onSelectPaymentMethod(method.provider)}
        >
          <div className="flex flex-col items-center p-2">
            {getPaymentMethodImage(method.provider) ? (
              <img
                src={getPaymentMethodImage(method.provider)}
                alt={method.provider}
                className="h-12 w-12 object-contain mb-2"
              />
            ) : (
              <div className="h-12 w-12 flex items-center justify-center mb-2">
                {getPaymentIcon(method.provider)}
              </div>
            )}
            <h3 className="font-medium text-center">
              {getPaymentMethodTitle(method.provider)}
            </h3>
            {selectedPlanPrice > 0 && (
              <p className="text-sm text-gray-500 mt-1">${selectedPlanPrice.toFixed(2)}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
