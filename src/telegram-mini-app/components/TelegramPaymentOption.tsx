import React from 'react';
import { Loader2 } from 'lucide-react';

interface TelegramPaymentOptionProps {
  method: string;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const TelegramPaymentOption: React.FC<TelegramPaymentOptionProps> = ({
  method,
  title,
  isSelected,
  onSelect,
  isLoading,
  error
}) => {
  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full p-4 rounded-lg border-2 transition-all duration-200
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm hover:transform hover:scale-[1.01]'
        }
        ${error ? 'border-red-300' : ''}
      `}
      disabled={isLoading}
    >
      <div className={`
        flex items-center justify-center space-x-2
        ${isSelected ? 'transform scale-105 transition-transform duration-200' : ''}
      `}>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : (
          <img
            src={`/lovable-uploads/${
              method === 'paypal' ? '1c14e367-8c74-4444-a692-e038a608ead2.png' :
              method === 'stripe' ? 'a668025a-d54c-42e4-947f-a7afcbcba732.png' :
              method === 'nowpayments' ? '00dfb1e4-1cfc-4004-a311-baa4d7576c25.png' : ''
            }`}
            alt={title}
            className={`w-6 h-6 transition-all duration-200 ${isSelected ? 'opacity-100' : 'opacity-80'}`}
          />
        )}
        <span className={`
          font-medium transition-all duration-200
          ${isSelected ? 'text-blue-700' : 'text-gray-700'}
        `}>
          {title}
        </span>
      </div>
      {error && (
        <div className="absolute -bottom-2 left-0 right-0 text-center">
          <p className="inline-block px-2 py-1 text-xs text-red-600 bg-red-50 rounded-md border border-red-200">
            {error}
          </p>
        </div>
      )}
    </button>
  );
};
