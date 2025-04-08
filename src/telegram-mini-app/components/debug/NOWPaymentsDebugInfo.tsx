
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

export const NOWPaymentsDebugInfo = () => {
  const [configInfo, setConfigInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadConfigInfo = async () => {
      try {
        setIsLoading(true);
        
        // נסה לקבל את מזהה הקהילה מה-URL
        const urlParams = new URLSearchParams(window.location.search);
        let communityId = urlParams.get('c') || urlParams.get('communityId');
        
        // אם אין מזהה קהילה, נסה למצוא מהלוקל סטורג
        if (!communityId) {
          const storedCommunity = localStorage.getItem('selectedCommunity');
          if (storedCommunity) {
            try {
              const communityData = JSON.parse(storedCommunity);
              communityId = communityData.id;
            } catch (e) {
              console.error('Error parsing stored community:', e);
            }
          }
        }
        
        if (!communityId) {
          setError('לא נמצא מזהה קהילה');
          return;
        }
        
        // קבל את מזהה בעל הקהילה
        const { data: communityData, error: communityError } = await supabase
          .from('communities')
          .select('owner_id')
          .eq('id', communityId)
          .single();
          
        if (communityError || !communityData?.owner_id) {
          console.error("Error fetching community owner:", communityError);
          setError('לא ניתן לקבל את פרטי בעל הקהילה');
          return;
        }
        
        // קבל את שיטת התשלום NOWPayments
        const { data: paymentMethod, error: paymentError } = await supabase
          .from('payment_methods')
          .select('id, is_active, config')
          .eq('provider', 'crypto')
          .eq('is_active', true)
          .eq('owner_id', communityData.owner_id)
          .maybeSingle();
          
        if (paymentError) {
          console.error("Error fetching payment method:", paymentError);
          setError('שגיאה בקבלת פרטי שיטת תשלום');
          return;
        }
        
        setConfigInfo({
          communityId,
          ownerId: communityData.owner_id,
          paymentMethodId: paymentMethod?.id || null,
          isActive: paymentMethod?.is_active || false,
          hasApiKey: paymentMethod?.config?.api_key ? true : false,
          hasIpnUrl: paymentMethod?.config?.ipn_callback_url ? true : false,
          apiKeyLength: paymentMethod?.config?.api_key?.length || 0
        });
      } catch (err) {
        console.error("Error loading config info:", err);
        setError('שגיאה בטעינת מידע תצורה');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfigInfo();
  }, []);
  
  if (isLoading) {
    return null;
  }
  
  return (
    <Card className="border-blue-200 bg-blue-50 mt-4">
      <CardHeader className="bg-blue-100 border-b border-blue-200 pb-2">
        <CardTitle className="text-sm font-medium text-blue-800 flex items-center">
          <InfoIcon className="h-4 w-4 mr-1" /> 
          מידע תצורה של NOWPayments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-xs">
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : configInfo ? (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">מזהה קהילה:</span>
              <span className="font-mono">{configInfo.communityId || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">מזהה בעל קהילה:</span>
              <span className="font-mono">{configInfo.ownerId || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">מזהה שיטת תשלום:</span>
              <span className="font-mono">{configInfo.paymentMethodId || 'לא מוגדר'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">פעיל:</span>
              <span>{configInfo.isActive ? '✅ כן' : '❌ לא'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">מפתח API קיים:</span>
              <span>{configInfo.hasApiKey ? '✅ כן' : '❌ לא'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">אורך מפתח API:</span>
              <span>{configInfo.apiKeyLength} תווים</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">כתובת IPN מוגדרת:</span>
              <span>{configInfo.hasIpnUrl ? '✅ כן' : '❌ לא'}</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">אין מידע זמין</div>
        )}
      </CardContent>
    </Card>
  );
};
