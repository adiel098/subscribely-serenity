
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TelegramPaymentOptionProps {
  method: 'paypal' | 'stripe' | 'crypto';
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
  const [imageError, setImageError] = useState(false);

  // Define image paths for each payment method with the new uploaded images
  const getImagePath = () => {
    switch (method) {
      case 'paypal':
        return "/lovable-uploads/1c14e367-8c74-4444-a692-e038a608ead2.png";
      case 'stripe':
        return "/lovable-uploads/a668025a-d54c-42e4-947f-a7afcbcba732.png";
      case 'crypto':
        return "/lovable-uploads/00dfb1e4-1cfc-4004-a311-baa4d7576c25.png";
      default:
        return "";
    }
  };

  // Log when component renders and when image path changes
  useEffect(() => {
    console.log(`[TelegramPaymentOption] Rendering ${method} option, selected: ${isSelected}`);
    console.log(`[TelegramPaymentOption] Image path for ${method}: ${getImagePath()}`);
    
    // Reset image error state when method changes
    setImageError(false);
  }, [method, isSelected]);

  const handleClick = async () => {
    if (disabled) return;
    
    console.log(`[TelegramPaymentOption] Selecting payment method: ${method}`);
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, demoDelay));
    setIsProcessing(false);
    onSelect();
  };

  const getBackgroundColor = () => {
    switch (method) {
      case 'paypal':
        return isSelected ? 'bg-blue-50' : 'bg-white';
      case 'stripe':
        return isSelected ? 'bg-indigo-50' : 'bg-white';
      case 'crypto':
        return isSelected ? 'bg-orange-50' : 'bg-white';
      default:
        return 'bg-white';
    }
  };

  const getBorderColor = () => {
    switch (method) {
      case 'paypal':
        return isSelected ? 'border-blue-500' : 'border-gray-200';
      case 'stripe':
        return isSelected ? 'border-indigo-500' : 'border-gray-200';
      case 'crypto':
        return isSelected ? 'border-orange-500' : 'border-gray-200';
      default:
        return 'border-gray-200';
    }
  };

  const handleImageError = () => {
    console.error(`[TelegramPaymentOption] Error loading image for ${method} payment method: ${getImagePath()}`);
    setImageError(true);
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
        getBorderColor(),
        getBackgroundColor(),
        isSelected ? 'shadow-lg' : 'hover:shadow-md',
        disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''
      )}
      onClick={handleClick}
    >
      <CardContent className="flex flex-col items-center justify-center text-center gap-3 p-5 h-32">
        {isProcessing ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="w-16 h-16 flex items-center justify-center">
              {!imageError ? (
                <img 
                  src={getImagePath()} 
                  alt={`${title} payment method`} 
                  className="max-h-full max-w-full object-contain"
                  onError={handleImageError} 
                  onLoad={() => console.log(`[TelegramPaymentOption] ${method} image loaded successfully`)}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                  {method.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3 className="font-medium text-gray-900 text-sm mt-2">{title}</h3>
          </>
        )}
      </CardContent>
    </Card>
  );
};
