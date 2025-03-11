
import React from "react";
import { Loader2, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PaymentMethodsGrid } from "../platform-payment/PaymentMethodsGrid";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";

interface PaymentMethodsSectionProps {
  selectedPlan: PlatformPlan | null;
  paymentMethods: any[] | null;
  paymentMethodsLoading: boolean;
  selectedPaymentMethod: string | null;
  isProcessing: boolean;
  handleSelectPaymentMethod: (method: string) => void;
  handlePaymentProcess: () => Promise<void>;
}

export const PaymentMethodsSection = ({
  selectedPlan,
  paymentMethods,
  paymentMethodsLoading,
  selectedPaymentMethod,
  isProcessing,
  handleSelectPaymentMethod,
  handlePaymentProcess
}: PaymentMethodsSectionProps) => {
  if (!selectedPlan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-indigo-100 rounded-lg p-6 shadow-sm overflow-hidden"
    >
      <h2 className="text-xl font-semibold mb-6 text-center">
        <CreditCard className="inline-block mr-2 h-5 w-5 text-indigo-500" />
        Payment Method for {selectedPlan.name} Plan
      </h2>
      
      <div className="mb-6">
        <PaymentMethodsGrid
          paymentMethods={paymentMethods}
          isLoading={paymentMethodsLoading}
          selectedPlanPrice={selectedPlan.price}
          isProcessing={isProcessing}
          onSelectPaymentMethod={handleSelectPaymentMethod}
          selectedPaymentMethod={selectedPaymentMethod}
        />
      </div>
      
      {selectedPaymentMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <Button 
            onClick={handlePaymentProcess}
            disabled={isProcessing}
            className="w-full py-6 text-lg font-semibold gap-2 transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay ${selectedPlan.price} for {selectedPlan.name} Plan
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
