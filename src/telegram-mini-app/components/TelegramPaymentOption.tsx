
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset image states when method changes
    setImageLoaded(false);
    setImageError(false);
  }, [method]);

  // Log image path for debugging
  useEffect(() => {
    console.log(`Payment option ${method} using image: ${getLogoSrc()}`);
  }, [method]);

  const handleClick = async () => {
    if (disabled) return;
    
    console.log(`Selecting payment method: ${method}`);
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, demoDelay));
    setIsProcessing(false);
    onSelect();
  };

  const getLogoSrc = () => {
    switch (method) {
      case 'paypal':
        return '/lovable-uploads/c0a686c7-818c-4126-a3c2-6d3f8bf92931.png';
      case 'stripe':
        return '/lovable-uploads/aebdbf36-f213-4bd7-a63c-ebf516bae3d9.png';
      case 'crypto':
        return '/lovable-uploads/641d0272-8589-423b-b0e4-84acf6ae6065.png';
      default:
        return '';
    }
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

  const handleImageLoad = () => {
    console.log(`Image for ${method} loaded successfully`);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image for ${method}:`, e);
    setImageError(true);
    setImageLoaded(false);
    // Set fallback image
    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4=';
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
            <div className="h-16 flex items-center justify-center">
              <img 
                src={getLogoSrc()} 
                alt={`${title} logo`} 
                className="max-h-full max-w-full object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            <h3 className="font-medium text-gray-900 text-sm mt-2">{title}</h3>
          </>
        )}
      </CardContent>
    </Card>
  );
};
