
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

  // Define image paths for each payment method with the new images
  const getImagePath = () => {
    switch (method) {
      case 'paypal':
        return "/lovable-uploads/e2437786-159b-4386-85b6-b4ebec9fae19.png";
      case 'stripe':
        return "/lovable-uploads/d055380d-245c-4dbf-987d-882c5637c43e.png";
      case 'crypto':
        return "/lovable-uploads/178720f1-1cf7-4ea6-83c4-6d544f2c5aba.png";
      default:
        return "";
    }
  };

  // Log when component renders
  useEffect(() => {
    console.log(`Payment option ${method} rendered, selected: ${isSelected}, image path: ${getImagePath()}`);
  }, [method, isSelected]);

  const handleClick = async () => {
    if (disabled) return;
    
    console.log(`Selecting payment method: ${method}`);
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
    console.error(`Error loading image for ${method} payment method: ${getImagePath()}`);
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
