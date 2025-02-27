
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

interface PaymentButtonProps {
  price: number;
  isProcessing: boolean;
  onClick: () => void;
}

export const PaymentButton = ({ price, isProcessing, onClick }: PaymentButtonProps) => {
  return (
    <div className="mt-8 space-y-4 animate-fade-in">
      <Button
        onClick={onClick}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-6 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="flex items-center">
              Pay ${price.toFixed(2)}
              <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
            </span>
            <span className="text-sm font-normal opacity-80 mt-1">Secure payment processing</span>
          </div>
        )}
      </Button>
    </div>
  );
};
