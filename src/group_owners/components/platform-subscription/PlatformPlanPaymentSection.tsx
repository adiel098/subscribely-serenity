
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentMethodsGrid } from "../platform-payment/PaymentMethodsGrid";
import { PlatformPlan } from "./PlatformPlanCard";

interface PlatformPlanPaymentSectionProps {
  selectedPlan: PlatformPlan | null;
  paymentMethods: any[];
  paymentMethodsLoading: boolean;
  onPaymentProcess: () => Promise<void>;
  isProcessing: boolean;
}

export const PlatformPlanPaymentSection = ({
  selectedPlan,
  paymentMethods,
  paymentMethodsLoading,
  onPaymentProcess,
  isProcessing
}: PlatformPlanPaymentSectionProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  if (!selectedPlan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="border border-indigo-100 rounded-lg p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold mb-6">
        Payment Method for {selectedPlan.name} Plan
      </h2>
      
      <PaymentMethodsGrid
        paymentMethods={paymentMethods}
        isLoading={paymentMethodsLoading}
        selectedPlanPrice={selectedPlan.price}
        isProcessing={isProcessing}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        selectedPaymentMethod={selectedPaymentMethod}
      />
      
      {selectedPaymentMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Button 
            onClick={onPaymentProcess}
            disabled={isProcessing}
            className="w-full py-6 text-lg font-semibold gap-2 shadow-md hover:shadow-lg"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay ${selectedPlan.price} for {selectedPlan.name} Plan
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
