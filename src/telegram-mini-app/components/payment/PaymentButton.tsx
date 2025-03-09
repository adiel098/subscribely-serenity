
import React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2, CreditCard } from "lucide-react";

interface PaymentButtonProps {
  price: number;
  isProcessing: boolean;
  onClick: () => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  price,
  isProcessing,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="flex justify-center"
    >
      <Button 
        onClick={onClick} 
        disabled={isProcessing} 
        size="lg"
        className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 py-6 text-lg font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {formatCurrency(price)}
          </>
        )}
      </Button>
    </motion.div>
  );
};
