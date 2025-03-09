
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, CreditCard, Wallet, Bitcoin } from "lucide-react";

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

  // Log when component renders
  useEffect(() => {
    console.log(`Payment option ${method} rendered, selected: ${isSelected}`);
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

  const getIcon = () => {
    switch (method) {
      case 'paypal':
        return (
          <div className="w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.092 6.38c.106-.69.023-1.393-.24-2.006-.328-.765-.923-1.36-1.679-1.688-.755-.329-1.59-.384-2.375-.155-.784.23-1.454.727-1.894 1.404-.073.113-.14.23-.198.352-.245-.55-.63-1.013-1.112-1.336-.756-.329-1.59-.384-2.375-.155-.784.23-1.454.727-1.894 1.404-.603.932-.776 2.106-.468 3.19l1.17 4.118c.038.134.178.222.318.184.002 0 .012-.003.012-.003l.978-.277a.378.378 0 0 0 .262-.33l.001-.018-.774-2.723c-.147-.515-.105-1.085.143-1.542.248-.456.644-.757 1.117-.848.473-.09.964-.004 1.38.243.418.247.717.654.842 1.15a.353.353 0 0 0 .342.262h.955c-.25.196-.407.46-.405.74a.882.882 0 0 0 .883.88h2.671c.349 0 .644-.269.644-.617 0-.35-.295-.617-.644-.617h-2.67a.168.168 0 0 1-.17-.168.168.168 0 0 1 .17-.167h2.67c.488 0 .883-.396.883-.88 0-.486-.395-.881-.883-.881h-1.164a.356.356 0 0 0-.342.262 1.774 1.774 0 0 1-.841 1.15 1.736 1.736 0 0 1-1.38.243 1.761 1.761 0 0 1-1.118-.848c-.248-.456-.29-1.027-.143-1.542l.774-2.723a.377.377 0 0 0-.263-.445.38.38 0 0 0-.073-.007L9.87 1.36a.378.378 0 0 0-.317.184L8.385 3.678c-.073-.113-.14-.229-.199-.352-.44-.676-1.11-1.174-1.894-1.404-.784-.229-1.619-.174-2.375.155-.755.328-1.35.923-1.679 1.688a4.032 4.032 0 0 0-.239 2.006c.013.087.028.173.046.258L4.021 17.38c.168.738.654 1.412 1.354 1.846.7.435 1.574.578 2.402.392L17.44 17.14c.738-.168 1.411-.655 1.845-1.354.435-.7.578-1.574.393-2.402L19.046 6.64c.018-.086.034-.172.046-.259z" fill="#003087"/>
              <path d="M8.582 21.464a.357.357 0 0 0 .444.235l2.873-.82a.356.356 0 0 0 .235-.444l-.227-.8a.356.356 0 0 0-.444-.236l-2.873.82a.356.356 0 0 0-.235.444l.227.8z" fill="#003087"/>
              <path d="M7.45 21.813a.356.356 0 0 0 .444.235l2.873-.819a.356.356 0 0 0 .235-.445l-.227-.8a.356.356 0 0 0-.444-.235l-2.873.82a.356.356 0 0 0-.235.444l.227.8zM6.318 22.162a.356.356 0 0 0 .444.235l2.873-.82a.356.356 0 0 0 .235-.444l-.227-.8a.356.356 0 0 0-.444-.235l-2.873.82a.356.356 0 0 0-.235.444l.227.8z" fill="#003087"/>
            </svg>
          </div>
        );
      case 'stripe':
        return (
          <div className="w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.83 19.348c-2.486 0-4.5-2.016-4.5-4.5s2.014-4.5 4.5-4.5c1.274 0 2.375.529 3.194 1.38l-1.615 1.729A2.304 2.304 0 0 0 13.83 12.3c-1.403 0-2.543 1.139-2.543 2.548 0 1.408 1.14 2.548 2.543 2.548.722 0 1.401-.302 1.88-.83l1.614 1.731a4.483 4.483 0 0 1-3.494 1.65zM10.255 6.315l-1.384 1.381c-.38-.533-1-1.03-1.936-1.03-.663 0-1.158.298-1.158.747 0 .451.345.606 1.237.903l.701.234c1.759.589 2.78 1.415 2.78 3.042 0 1.779-1.47 3.117-3.941 3.117-1.683 0-3.154-.616-4.14-1.957l1.442-1.371c.498.797 1.362 1.38 2.61 1.38.818 0 1.326-.33 1.326-.826 0-.534-.54-.675-1.47-.988l-.7-.233c-1.5-.497-2.541-1.249-2.541-2.925 0-1.684 1.453-2.985 3.622-2.985 1.556 0 2.893.587 3.552 1.511z" fill="#6772E5"/>
              <path d="M23.414 10.973c0-2.155-1.033-3.89-3.004-3.89-1.97 0-3.194 1.735-3.194 3.873 0 2.547 1.42 3.845 3.461 3.845 1.001 0 1.759-.233 2.33-.563v-1.888c-.572.302-1.224.485-2.06.485-1.046 0-1.64-.554-1.697-1.544h4.133c0-.106.03-.485.03-.318zm-4.19-.746c0-.963.584-1.631 1.17-1.631.59 0 1.128.662 1.128 1.63h-2.298z" fill="#6772E5"/>
            </svg>
          </div>
        );
      case 'crypto':
        return (
          <div className="w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#F7931A"/>
              <path d="M15.49 10.88c-.23-.61-.61-1.08-1.14-1.42-.54-.33-1.13-.5-1.78-.5h-2.24v3.92h2.24c.64 0 1.23-.17 1.78-.5.53-.33.91-.8 1.14-1.42 0 0 0-.02.01-.04s0-.02-.01-.04zm-3.5 2.5h-1.66v-4.08h1.66c.68 0 1.31.17 1.89.52.58.35 1.03.82 1.35 1.42.32.6.48 1.27.48 2s-.16 1.4-.48 2c-.32.6-.77 1.08-1.35 1.42-.58.35-1.21.52-1.89.52h-1.66V13.38z" fill="#F7931A"/>
              <path d="M12 9.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" fill="#F7931A"/>
            </svg>
          </div>
        );
      default:
        return <CreditCard className="h-12 w-12 text-gray-500" />;
    }
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
            {getIcon()}
            <h3 className="font-medium text-gray-900 text-sm mt-2">{title}</h3>
          </>
        )}
      </CardContent>
    </Card>
  );
};
