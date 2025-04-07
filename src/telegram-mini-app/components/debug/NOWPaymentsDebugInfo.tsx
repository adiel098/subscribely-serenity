
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle } from "lucide-react";

export const NOWPaymentsDebugInfo: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Get config from any active crypto payment method (not specific to any community)
        const { data, error } = await supabase
          .from('payment_methods')
          .select('config')
          .eq('provider', 'crypto')
          .eq('is_active', true)
          .maybeSingle();
          
        if (error) throw error;
        setConfig(data?.config || null);
      } catch (err) {
        console.error("Error fetching NOWPayments config:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch config");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  if (isLoading) {
    return (
      <div className="p-2 bg-gray-100 rounded">
        <p className="text-xs">Loading NOWPayments config...</p>
      </div>
    );
  }
  
  const hasApiKey = config?.api_key && config.api_key.length > 0;
  const hasIpnUrl = config?.ipn_callback_url && config.ipn_callback_url.length > 0;
  
  return (
    <div className="p-2 bg-gray-100 rounded border border-gray-200 mb-2">
      <h4 className="text-xs font-semibold mb-1">NOWPayments Config</h4>
      
      {error ? (
        <div className="flex items-start text-xs text-red-600">
          <AlertCircle className="h-3 w-3 mr-1 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            {hasApiKey ? (
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span>API Key: {hasApiKey ? 'Configured' : 'Missing'}</span>
          </div>
          
          <div className="flex items-center">
            {hasIpnUrl ? (
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1 text-orange-500" />
            )}
            <span>IPN URL: {hasIpnUrl ? config.ipn_callback_url : 'Not configured'}</span>
          </div>
          
          {!hasApiKey && (
            <div className="text-red-600 text-xs mt-1">
              NOWPayments API key must be configured in database for crypto payments to work!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
