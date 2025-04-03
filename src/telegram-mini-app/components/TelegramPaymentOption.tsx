
import React from 'react';
import { CreditCard, Wallet, Bitcoin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TelegramPaymentOptionProps {
  method: 'stripe' | 'paypal' | 'crypto';
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  children?: React.ReactNode;
}

export const TelegramPaymentOption: React.FC<TelegramPaymentOptionProps> = ({
  method,
  title,
  isSelected,
  onSelect,
  children
}) => {
  const getIcon = () => {
    switch (method) {
      case 'stripe':
        return <CreditCard className="h-5 w-5" />;
      case 'paypal':
        return <Wallet className="h-5 w-5" />;
      case 'crypto':
        return <Bitcoin className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center p-4 border rounded-lg transition-all cursor-pointer hover:border-indigo-300 hover:shadow-sm',
        isSelected
          ? 'bg-indigo-50 border-indigo-300 shadow-sm'
          : 'bg-white border-gray-200'
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-full mb-2',
          isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
        )}
      >
        {getIcon()}
      </div>
      <span
        className={cn(
          'font-medium',
          isSelected ? 'text-indigo-700' : 'text-gray-700'
        )}
      >
        {title}
      </span>
      
      {children}
    </div>
  );
};
