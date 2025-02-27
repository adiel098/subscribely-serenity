
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

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
        className="px-8 py-6 text-lg font-semibold gap-2 w-full max-w-sm"
        onClick={onClick}
        disabled={isProcessing}
      >
        <Heart className="h-5 w-5" />
        {isProcessing ? 'Processing...' : `Pay $${price}`}
      </Button>
      <p className="text-sm text-muted-foreground pb-8">
        Click the button above to complete your payment
      </p>
    </div>
  );
};
