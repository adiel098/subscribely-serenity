
import React from "react";
import { Loader2 } from "lucide-react";

interface NOWPaymentsEmbeddedFrameProps {
  invoiceId: string | null;
  isLoading?: boolean;
}

export const NOWPaymentsEmbeddedFrame: React.FC<NOWPaymentsEmbeddedFrameProps> = ({
  invoiceId,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-50 border rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500 mb-2" />
          <p className="text-gray-500">יוצר חשבונית תשלום...</p>
        </div>
      </div>
    );
  }

  if (!invoiceId) {
    return null;
  }

  const iframeUrl = `https://nowpayments.io/embeds/payment-widget?iid=${invoiceId}`;

  return (
    <div className="w-full overflow-hidden rounded-lg border border-amber-200 bg-white">
      <div className="p-3 bg-amber-50 border-b border-amber-200">
        <h3 className="font-medium text-amber-800">בצע תשלום בקריפטו</h3>
        <p className="text-sm text-amber-700">השלם את התשלום בממשק המאובטח למטה</p>
      </div>
      <div className="flex items-center justify-center w-full">
        <iframe 
          src={iframeUrl}
          width="100%" 
          height="600" 
          frameBorder="0" 
          scrolling="no"
          className="mx-auto block"
          style={{ overflowY: 'hidden', maxWidth: '420px' }}
          title="NOWPayments checkout"
        >
          לא ניתן לטעון את ממשק התשלום
        </iframe>
      </div>
    </div>
  );
};
