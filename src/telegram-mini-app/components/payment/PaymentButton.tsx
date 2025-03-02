
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart, CreditCard, Loader2 } from "lucide-react";

interface PaymentButtonProps {
  price: number;
  isProcessing: boolean;
  onClick: () => void;
}

export const PaymentButton = ({ price, isProcessing, onClick }: PaymentButtonProps) => {
  return (
    <div className="flex flex-col items-center space-y-4 animate-fade-in">
      <Button 
        size="lg" 
        className="px-8 py-6 text-lg font-semibold gap-2 w-full max-w-sm transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
        onClick={onClick}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Pay ${price}
          </>
        )}
      </Button>
      <p className="text-sm text-muted-foreground pb-8 animate-pulse">
        {isProcessing ? 
          'Please wait while we process your payment...' : 
          'Click the button above to complete your payment'}
      </p>
    </div>
  );
};
