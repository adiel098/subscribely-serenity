
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, CreditCard, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

interface PaymentButtonProps {
  price: number;
  isProcessing: boolean;
  onClick: () => void;
}

export const PaymentButton = ({ price, isProcessing, onClick }: PaymentButtonProps) => {
  const handlePaymentClick = () => {
    // Show toast when payment is initiated
    if (!isProcessing) {
      toast({
        title: "Processing payment",
        description: "Please wait while we process your payment...",
        duration: 3000,
      });
      onClick();
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4 animate-fade-in">
      <motion.div 
        className="w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button 
          size="lg" 
          className="px-8 py-6 text-lg font-semibold gap-2 w-full max-w-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none"
          onClick={handlePaymentClick}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing payment...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              💳 Pay ${price} 
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>
      <motion.p 
        className="text-sm text-muted-foreground pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isProcessing ? 
          '⏳ Please wait while we process your payment...' : 
          '🔒 Secure payment - Click the button above to complete payment'}
      </motion.p>
    </div>
  );
};
