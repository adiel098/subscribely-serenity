
import { Loader2, CreditCard, Wallet, Bitcoin } from "lucide-react";
import { PaymentMethodCard } from "./PaymentMethodCard";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: string;
  provider: string;
  is_active: boolean;
}

interface PaymentMethodsGridProps {
  paymentMethods: PaymentMethod[] | null;
  isLoading: boolean;
  selectedPlanPrice: number;
  isProcessing: boolean;
  onSelectPaymentMethod: (method: string) => void;
  selectedPaymentMethod: string | null;
}

export const PaymentMethodsGrid = ({
  paymentMethods,
  isLoading,
  selectedPlanPrice,
  isProcessing,
  onSelectPaymentMethod,
  selectedPaymentMethod
}: PaymentMethodsGridProps) => {
  
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe':
        return <CreditCard className="h-6 w-6" />;
      case 'paypal':
        return <Wallet className="h-6 w-6" />;
      case 'crypto':
        return <Bitcoin className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        className="grid gap-4 md:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {paymentMethods && paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              id={method.id}
              provider={method.provider}
              icon={getPaymentMethodIcon(method.provider)}
              price={selectedPlanPrice}
              isProcessing={isProcessing && selectedPaymentMethod === method.provider}
              onSelect={onSelectPaymentMethod}
              isSelected={selectedPaymentMethod === method.provider}
            />
          ))
        ) : (
          <div className="col-span-3 p-6 text-center border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">No payment methods are currently available. Please try again later.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
