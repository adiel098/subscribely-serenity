import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TelegramPaymentOptionProps {
  icon: string;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  demoDelay?: number;
}

export const TelegramPaymentOption = ({ 
  icon, 
  title,
  isSelected,
  onSelect,
  demoDelay = 1500
}: TelegramPaymentOptionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, demoDelay));
    setIsProcessing(false);
    onSelect();
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105",
        isSelected ? 'border-primary shadow-lg' : 'hover:border-primary/50 hover:shadow-md'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
        {isProcessing ? (
          <div className="p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isSelected ? 'bg-primary/20' : 'bg-primary/10'
          )}>
            <img src={icon} alt={title} className="h-12 w-12" />
          </div>
        )}
        <h3 className="font-medium text-gray-900 text-lg">{title}</h3>
      </CardContent>
    </Card>
  );
};

