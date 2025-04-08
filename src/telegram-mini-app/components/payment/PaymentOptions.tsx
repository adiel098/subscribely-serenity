
import React, { useEffect, useState } from "react";
import { TelegramPaymentOption } from "@/telegram-mini-app/components/TelegramPaymentOption";
import StripePaymentForm from "./StripePaymentForm";
import { motion } from "framer-motion";
import { NOWPaymentsButton } from "./NOWPaymentsButton";
import { NOWPaymentsLogs } from "../debug/NOWPaymentsLogs";
import { NOWPaymentsDebugInfo } from "../debug/NOWPaymentsDebugInfo";
import { logNOWPaymentsOperation } from "../debug/NOWPaymentsLogs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  
  useEffect(() => {
    console.log("[PaymentOptions] Rendering with selectedMethod:", selectedPaymentMethod);
    console.log("[PaymentOptions] Community ID:", communityId);
    console.log("[PaymentOptions] Price:", price);
  }, [selectedPaymentMethod, communityId, price]);

  useEffect(() => {
    const fetchNowPaymentsConfig = async () => {
      if (selectedPaymentMethod === 'nowpayments') {
        setIsLoadingConfig(true);
        setConfigError(null);
        setLoadingError(null);
        
        try {
          logNOWPaymentsOperation('info', 'טוען קונפיגורציית תשלומי קריפטו', { communityId });
          
          const { data: communityData, error: communityError } = await supabase
            .from('communities')
            .select('owner_id')
            .eq('id', communityId)
            .single();
            
          if (communityError) {
            console.error("[PaymentOptions] Community error:", communityError);
            logNOWPaymentsOperation('error', 'שגיאה בטעינת פרטי קהילה', { error: communityError });
            setLoadingError(`שגיאה בטעינת פרטי קהילה: ${communityError.message || 'שגיאת שרת'}`);
            throw new Error(`Could not find community: ${communityError.message}`);
          }
          
          if (!communityData?.owner_id) {
            console.error("[PaymentOptions] Missing owner_id for community:", communityId);
            logNOWPaymentsOperation('error', 'קהילה חסרת בעלים', { communityId });
            setLoadingError(`קהילה חסרת בעלים: ${communityId}`);
            throw new Error('Community has no owner');
          }
          
          setCommunityOwnerId(communityData.owner_id);
          console.log("[PaymentOptions] Found community owner ID:", communityData.owner_id);
          logNOWPaymentsOperation('info', 'מצא מזהה בעלי קהילה', { ownerId: communityData.owner_id });
          
          const { data, error } = await supabase
            .from('payment_methods')
            .select('config')
            .eq('provider', 'crypto')
            .eq('is_active', true)
            .eq('owner_id', communityData.owner_id)
            .maybeSingle();
            
          if (error) {
            console.error("[PaymentOptions] Error fetching payment methods:", error);
            logNOWPaymentsOperation('error', 'שגיאה בטעינת שיטות תשלום', { error });
            setLoadingError(`שגיאה בטעינת שיטות תשלום: ${error.message || 'שגיאת שרת'}`);
            throw error;
          }
          
          console.log("[PaymentOptions] Retrieved payment method:", data);
          
          if (!data || !data.config || !data.config.api_key) {
            const errorMsg = "NOWPayments API key is not configured in the database";
            console.error("[PaymentOptions] NOWPayments config missing or invalid:", data);
            logNOWPaymentsOperation('error', 'מפתח API של NOWPayments חסר או לא תקין', { 
              configExists: !!data,
              hasConfigObject: !!(data && data.config)
            });
            setConfigError(errorMsg);
            toast({
              title: "שגיאת תצורה",
              description: "מפתח ה-API של NOWPayments אינו מוגדר כראוי. יש ליצור קשר עם מנהל המערכת.",
              variant: "destructive"
            });
          } else {
            console.log("[PaymentOptions] NOWPayments config loaded successfully");
            logNOWPaymentsOperation('info', 'קונפיגורציית NOWPayments נטענה בהצלחה', {
              hasApiKey: !!data.config.api_key,
              hasIpnUrl: !!data.config.ipn_callback_url
            });
          }
          
          setNowPaymentsConfig(data?.config || {});
        } catch (err) {
          console.error("[PaymentOptions] Error fetching NOWPayments config:", err);
          const errorMsg = `Failed to load payment configuration: ${err instanceof Error ? err.message : 'Unknown error'}`;
          setConfigError(errorMsg);
          logNOWPaymentsOperation('error', 'שגיאה בטעינת קונפיגורציית תשלומי קריפטו', { 
            error: err instanceof Error ? err.message : String(err)
          });
          if (!loadingError) {
            setLoadingError(`שגיאה בטעינת הגדרות תשלום: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
          }
          toast({
            title: "שגיאה",
            description: "לא ניתן לטעון את הגדרות תשלומי הקריפטו. נסה לבחור שיטת תשלום אחרת.",
            variant: "destructive"
          });
        } finally {
          setIsLoadingConfig(false);
        }
      }
    };
    
    fetchNowPaymentsConfig();
  }, [selectedPaymentMethod, communityId]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handlePaymentMethodSelect = (method: string) => {
    console.log(`[PaymentOptions] Payment method selected: ${method}`);
    onPaymentMethodSelect(method);
  };
  
  const handleNOWPaymentsSuccess = (paymentData: any) => {
    console.log("[PaymentOptions] NOWPayments payment initiated:", paymentData);
    logNOWPaymentsOperation('info', 'עסקת NOW Payments נוצרה בהצל��ה', paymentData);
    
    toast({
      title: "חשבונית נוצרה",
      description: "חשבונית התשלום נוצרה בהצלחה. השלם את התשלום בטופס שמופיע.",
    });
    
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
          console.error("[PaymentOptions] Error checking stored transaction:", error);
          logNOWPaymentsOperation('error', 'שגיאה בבדיקת עסקה מאוחסנת', { 
            error: error instanceof Error ? error.message : String(error)
          });
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
          console.log("[PaymentOptions] Found stored NOWPayments transaction:", transaction);
          
          if (Date.now() - transaction.timestamp > 3600000) {
            localStorage.removeItem('nowpayments_transaction');
            return;
          }
          
          onPaymentSuccess();
          
          localStorage.removeItem('nowpayments_transaction');
        } catch (error) {
          console.error("[PaymentOptions] Error checking stored transaction:", error);
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
      {(process.env.NODE_ENV === 'development' || new URLSearchParams(window.location.search).get('debug') === 'true') && (
        <>
          <NOWPaymentsDebugInfo />
          <NOWPaymentsLogs />
        </>
      )}
      
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
      
      <motion.div
        className="grid grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="paypal"
            title="PayPal"
            isSelected={selectedPaymentMethod === 'paypal'}
            onSelect={() => handlePaymentMethodSelect('paypal')}
          />
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="stripe"
            title="Stripe"
            isSelected={selectedPaymentMethod === 'stripe'}
            onSelect={() => handlePaymentMethodSelect('stripe')}
          />
        </motion.div>
        
        <motion.div variants={item} whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
          <TelegramPaymentOption
            method="nowpayments"
            title="קריפטו"
            isSelected={selectedPaymentMethod === 'nowpayments'}
            onSelect={() => handlePaymentMethodSelect('nowpayments')}
          />
        </motion.div>
      </motion.div>

      {selectedPaymentMethod === 'stripe' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <StripePaymentForm
            communityId={communityId}
            onSuccess={onPaymentSuccess}
            price={price}
          />
        </motion.div>
      )}
      
      {selectedPaymentMethod === 'nowpayments' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <div className="rounded-lg border p-4 bg-amber-50 border-amber-100">
            <h3 className="text-lg font-semibold mb-3">תשלום בקריפטו</h3>
            <p className="text-sm text-gray-600 mb-4">
              שלם באמצעות המטבע הקריפטוגרפי המועדף עליך. טופס התשלום יופיע כאן לאחר לחיצה על הכפתור.
            </p>
            
            {isLoadingConfig && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-amber-600 mr-2" /> 
                <span>טוען הגדרות תשלום...</span>
              </div>
            )}
            
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
            
            <NOWPaymentsButton
              amount={price}
              apiKey={nowPaymentsConfig?.api_key || ''}
              ipnCallbackUrl={nowPaymentsConfig?.ipn_callback_url || `${window.location.origin}/functions/v1/nowpayments-ipn`}
              orderId={getNOWPaymentsOrderId()}
              description={`מנוי לקבוצת טלגרם - $${price}`}
              onSuccess={handleNOWPaymentsSuccess}
              onError={(error) => {
                console.error("[PaymentOptions] NOWPayments error:", error);
                logNOWPaymentsOperation('error', 'שגיאה בתהליך תשלום', { error });
                setConfigError(error);
                toast({
                  title: "שגיאה",
                  description: error || "אירעה שגיאה בעת עיבוד התשלום שלך. אנא נסה שוב.",
                  variant: "destructive"
                });
              }}
            />
            
            {(process.env.NODE_ENV === 'development' || new URLSearchParams(window.location.search).get('debug') === 'true') && (
              <div className="mt-4 p-2 bg-gray-100 rounded-lg border border-gray-300">
                <h4 className="font-bold text-sm flex items-center mb-1">
                  <span className="mr-1">🔍</span> פרטי תצורה:
                </h4>
                
                {communityOwnerId && (
                  <div className="bg-indigo-50 p-2 rounded-md border border-indigo-100 mb-2">
                    <div className="flex items-center text-indigo-800 font-medium">
                      <User className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                      <span>מזהה בעלים:</span>
                    </div>
                    <div className="font-mono text-xs bg-white/70 px-1.5 py-0.5 rounded mt-0.5 text-indigo-900 border border-indigo-50 break-all">
                      {communityOwnerId}
                    </div>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="flex items-center">
                    <strong>מפתח API קיים:</strong> 
                    <span className="mr-1">{nowPaymentsConfig?.api_key ? '✅ כן' : '❌ לא'}</span>
                  </p>
                  <p><strong>כתובת IPN מוגדרת:</strong> {nowPaymentsConfig?.ipn_callback_url ? '✅ כן' : '❌ לא'}</p>
                  <p><strong>מזהה קהילה:</strong> {communityId}</p>
                  <p><strong>מחיר:</strong> {price} USD</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
