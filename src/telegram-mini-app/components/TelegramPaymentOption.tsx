
import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, CreditCard, Wallet, BanknoteIcon } from "lucide-react";

interface TelegramPaymentOptionProps {
  method: 'paypal' | 'card' | 'bank';
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  demoDelay?: number;
}

export const TelegramPaymentOption = ({ 
  method, 
  title,
  isSelected,
  onSelect,
  disabled = false,
  demoDelay = 1500
}: TelegramPaymentOptionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    if (disabled) return;
    
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, demoDelay));
    setIsProcessing(false);
    onSelect();
  };

  const getIcon = () => {
    switch (method) {
      case 'paypal':
        return <Wallet className="h-6 w-6" />;
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      case 'bank':
        return <BanknoteIcon className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105",
        isSelected ? 'border-primary shadow-lg' : 'hover:border-primary/50 hover:shadow-md',
        disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
        {isProcessing ? (
          <div className="p-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className={cn(
            "p-3 rounded-full transition-colors",
            isSelected ? 'bg-primary/20' : 'bg-primary/10'
          )}>
            {getIcon()}
          </div>
        )}
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
      </CardContent>
    </Card>
  );
};
