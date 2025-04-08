import React, { useEffect, useState } from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import StripePaymentForm from "./StripePaymentForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { createNowPaymentsInvoice } from "@/integrations/nowpayments/api";
import { NOWPaymentsModal } from "./NOWPaymentsModal";

interface PaymentOptionsProps {
  selectedPaymentMethod: string | null;
  onPaymentMethodSelect: (method: string) => void;
  stripeConfig: any;
  communityId: string;
  price: number;
  onPaymentSuccess: () => void;
}

export const PaymentOptions = ({
  selectedPaymentMethod,
  onPaymentMethodSelect,
  stripeConfig,
  communityId,
  price,
  onPaymentSuccess
}: PaymentOptionsProps) => {
  const [nowPaymentsConfig, setNowPaymentsConfig] = useState<any>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [communityOwnerId, setCommunityOwnerId] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchNowPaymentsConfig = async () => {
      if (selectedPaymentMethod === 'nowpayments') {
        setIsLoadingConfig(true);
        setConfigError(null);
        setLoadingError(null);
        
        try {
          const { data: communityData, error: communityError } = await supabase
            .from('communities')
            .select('owner_id')
            .eq('id', communityId)
            .single();
            
          if (communityError) {
            setLoadingError(`שגיאה בטעינת פרטי קהילה: ${communityError.message || 'שגיאת שרת'}`);
            throw new Error(`Could not find community: ${communityError.message}`);
          }
          
          if (!communityData?.owner_id) {
            setLoadingError(`קהילה חסרת בעלים: ${communityId}`);
            throw new Error('Community has no owner');
          }
          
          setCommunityOwnerId(communityData.owner_id);
          
          const { data, error } = await supabase
            .from('payment_methods')
            .select('config')
            .eq('provider', 'crypto')
            .eq('is_active', true)
            .eq('owner_id', communityData.owner_id)
            .maybeSingle();
            
          if (error) {
            setLoadingError(`שגיאה בטעינת שיטות תשלום: ${error.message || 'שגיאת שרת'}`);
            throw error;
          }
          
          if (!data || !data.config || !data.config.api_key) {
            const errorMsg = "NOWPayments API key is not configured in the database";
            setConfigError(errorMsg);
          } else {
            setNowPaymentsConfig(data?.config || {});
          }
        } catch (err) {
          const errorMsg = `Failed to load payment configuration: ${err instanceof Error ? err.message : 'Unknown error'}`;
          setConfigError(errorMsg);
          if (!loadingError) {
            setLoadingError(`שגיאה בטעינת הגדרות תשלום: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
          }
        } finally {
          setIsLoadingConfig(false);
        }
      }
    };
    
    fetchNowPaymentsConfig();
  }, [selectedPaymentMethod, communityId]);

  const handlePaymentMethodSelect = (method: string) => {
    onPaymentMethodSelect(method);
  };
  
  const handleNOWPaymentsSuccess = (paymentData: any) => {
    setTimeout(() => {
      const storedTransaction = localStorage.getItem('nowpayments_transaction');
      if (storedTransaction) {
        try {
          const transaction = JSON.parse(storedTransaction);
          const timeElapsed = Date.now() - transaction.timestamp;
          
          if (timeElapsed > 30000) {
            onPaymentSuccess();
          }
        } catch (error) {
          console.error("Error checking stored transaction:", error);
        }
      }
    }, 30000);
  };

  useEffect(() => {
    const checkStoredTransaction = async () => {
      const storedTransaction = localStorage.getItem('nowpayments_transaction');
      if (storedTransaction) {
        try {
          const transaction = JSON.parse(storedTransaction);
          
          if (Date.now() - transaction.timestamp > 3600000) {
            localStorage.removeItem('nowpayments_transaction');
            return;
          }
          
          onPaymentSuccess();
          
          localStorage.removeItem('nowpayments_transaction');
        } catch (error) {
          console.error("Error checking stored transaction:", error);
          localStorage.removeItem('nowpayments_transaction');
        }
      }
    };
    
    checkStoredTransaction();
  }, [onPaymentSuccess]);

  const getNOWPaymentsOrderId = () => {
    return `${communityId}_${Date.now()}`;
  };

  return (
    <div className="space-y-8">
      {loadingError && (
        <div className="p-3 bg-red-50 rounded-md border border-red-200 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">שגיאה בטעינת הגדרות תשלום</p>
              <p className="text-red-700 text-sm mt-1">{loadingError}</p>
              <p className="text-sm text-gray-700 mt-2">
                נסה לבחור שיטת תשלום אחרת או צור קשר עם מנהל הקבוצה.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <TelegramPaymentOption
            method="paypal"
            title="PayPal"
            isSelected={selectedPaymentMethod === 'paypal'}
            onSelect={() => handlePaymentMethodSelect('paypal')}
          />
        </div>
        
        <div>
          <TelegramPaymentOption
            method="stripe"
            title="Stripe"
            isSelected={selectedPaymentMethod === 'stripe'}
            onSelect={() => handlePaymentMethodSelect('stripe')}
          />
        </div>
        
        <div>
          <TelegramPaymentOption
            method="nowpayments"
            title="קריפטו"
            isSelected={selectedPaymentMethod === 'nowpayments'}
            onSelect={() => handlePaymentMethodSelect('nowpayments')}
          />
        </div>
      </div>

      {selectedPaymentMethod === 'stripe' && (
        <div className="mt-8">
          <StripePaymentForm
            communityId={communityId}
            onSuccess={onPaymentSuccess}
            price={price}
          />
        </div>
      )}
      
      {selectedPaymentMethod === 'nowpayments' && (
        <div className="mt-8">
          {configError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-700">שגיאת תצורה</p>
                  <p className="text-red-600">{configError}</p>
                  <p className="mt-1 text-gray-700">
                    שיטת התשלום הזו לא מוגדרת במלואה. אנא נסה אמצעי תשלום אחר או צור קשר עם התמיכה.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full max-w-md bg-gradient-to-r from-blue-600 to-indigo-600 py-6 text-lg font-medium shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
            onClick={async () => {
              if (!nowPaymentsConfig?.api_key) {
                setConfigError("NOWPayments API key is not configured");
                return;
              }

              try {
                setIsLoadingConfig(true);
                const orderId = getNOWPaymentsOrderId();
                
                const response = await createNowPaymentsInvoice({
                  apiKey: nowPaymentsConfig.api_key,
                  price: price,
                  orderId: orderId,
                  ipnCallbackUrl: nowPaymentsConfig?.ipn_callback_url || `${window.location.origin}/functions/v1/nowpayments-ipn`,
                  description: `מנוי לקבוצת טלגרם - $${price}`
                });

                if (response.error) {
                  throw new Error(response.error);
                }

                // שמירת פרטי העסקה ב-localStorage
                localStorage.setItem('nowpayments_transaction', JSON.stringify({
                  orderId,
                  invoiceId: response.id,
                  timestamp: Date.now()
                }));

                // הצגת המודל עם ה-iframe
                setIsModalOpen(true);
                setInvoiceUrl(response.invoice_url);

              } catch (error) {
                console.error('Error creating NOWPayments invoice:', error);
                setConfigError(error instanceof Error ? error.message : 'Failed to create payment invoice');
              } finally {
                setIsLoadingConfig(false);
              }
            }}
            disabled={isLoadingConfig || !!configError}
          >
            {isLoadingConfig ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                טוען...
              </span>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                שלם ${price}
              </>
            )}
          </Button>

          {isModalOpen && invoiceUrl && (
            <NOWPaymentsModal
              invoiceUrl={invoiceUrl}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};
