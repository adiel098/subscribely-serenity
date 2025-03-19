import React from "react";
import { PaymentMethodCard } from "@/group_owners/components/payments/PaymentMethodCard";
import { CreditCard, Wallet, Bitcoin, LucideIcon } from "lucide-react";
import { PAYMENT_METHOD_IMAGES } from "@/group_owners/data/paymentMethodsData";
import { PaymentMethod } from "@/group_owners/hooks/types/subscription.types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface PaymentMethodsGridProps {
  paymentMethods: PaymentMethod[] | undefined;
  isLoading: boolean;
  userId: string | undefined;
  onTogglePaymentMethod: (id: string, isActive: boolean) => void;
}

export const PaymentMethodsGrid = ({
  paymentMethods,
  isLoading,
  userId,
  onTogglePaymentMethod,
}: PaymentMethodsGridProps) => {
  const isPaymentMethodConfigured = (method: PaymentMethod) => {
    return method.config && Object.keys(method.config).length > 0;
  };

  // Define a mapping of payment providers to their corresponding Lucide icons
  const getPaymentMethodIcon = (provider: string): LucideIcon => {
    switch (provider) {
      case 'stripe':
        return CreditCard;
      case 'paypal':
        return Wallet;
      case 'crypto':
        return Bitcoin;
      default:
        return CreditCard;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((_, i) => (
          <Card key={i} className="h-80">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-10 w-full mt-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!paymentMethods?.length) {
    return (
      <EmptyState
        icon={<CreditCard className="h-10 w-10 text-indigo-500" />}
        title="No payment methods available"
        description="To complete your setup, you need to configure at least one payment method that will be used across all your communities"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {paymentMethods.map((method) => {
        const Icon = getPaymentMethodIcon(method.provider);
        const imageSrc = PAYMENT_METHOD_IMAGES[method.provider];
        
        return (
          <PaymentMethodCard
            key={method.id}
            icon={Icon}
            title={
              method.provider === 'stripe' ? 'Stripe' : 
              method.provider === 'paypal' ? 'PayPal' : 
              method.provider === 'crypto' ? 'Crypto' : 
              method.provider
            }
            description={
              method.provider === 'stripe' ? 'Accept payments with credit cards' : 
              method.provider === 'paypal' ? 'Accept payments with PayPal' : 
              method.provider === 'crypto' ? 'Accept payments with cryptocurrencies' : 
              'Payment method'
            }
            isActive={method.is_active || false}
            onToggle={(active) => onTogglePaymentMethod(method.id, active)}
            isConfigured={isPaymentMethodConfigured(method)}
            onConfigure={() => {}}
            imageSrc={imageSrc}
            provider={method.provider}
            ownerId={method.owner_id}
          />
        );
      })}
    </div>
  );
};
