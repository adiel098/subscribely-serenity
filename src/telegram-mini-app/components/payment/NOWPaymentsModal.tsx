import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface NOWPaymentsModalProps {
  invoiceUrl: string;
  onClose: () => void;
}

export const NOWPaymentsModal: React.FC<NOWPaymentsModalProps> = ({ invoiceUrl, onClose }) => {
  useEffect(() => {
    // מונע את הגלילה בדף הראשי כשהמודל פתוח
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative w-[90%] max-w-2xl bg-white rounded-lg p-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <iframe
          src={invoiceUrl}
          className="w-full h-[600px] border-none"
          title="NOWPayments Invoice"
        />
      </div>
    </div>
  );
};
