
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, InfoIcon, Loader2 } from "lucide-react";

// Define a proper type for the debug info object
interface DebugInfo {
  lookupMethod: string;
  communityId: string;
  steps: string[];
  ownerId?: string;
  hasConfig?: boolean;
  communityName?: string;
  paymentMethodId?: string;
  hasApiKey?: boolean | string;
  error?: string;
}

export const NOWPaymentsDebugInfo: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [communityOwner, setCommunityOwner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    lookupMethod: '',
    communityId: '',
    steps: []
  });
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Get community ID from URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const communityId = urlParams.get('communityId');
        
        // Store debug information
        const debug: DebugInfo = {
          lookupMethod: communityId ? 'specific_community' : 'any_active',
          communityId: communityId || 'none',
          steps: []
        };
        
        if (!communityId) {
          debug.steps.push('No community ID in URL, looking for any active crypto payment method');
          
          // Get config from any active crypto payment method
          const { data, error } = await supabase
            .from('payment_methods')
            .select('config, owner_id')
            .eq('provider', 'crypto')
            .eq('is_active', true)
            .maybeSingle();
            
          debug.steps.push(`Query result: ${data ? 'Data found' : 'No data'}, Error: ${error ? error.message : 'None'}`);
          
          if (error) throw error;
          
          if (!data) {
            debug.steps.push('No active payment methods found');
            throw new Error('No active crypto payment methods found');
          }
          
          setConfig(data?.config || null);
          setCommunityOwner(data?.owner_id || null);
          debug.ownerId = data?.owner_id;
          debug.hasConfig = !!data?.config;
        } else {
          debug.steps.push(`Looking up config for community ID: ${communityId}`);
          
          // First get the community owner
          const { data: communityData, error: communityError } = await supabase
            .from('communities')
            .select('owner_id, name')
            .eq('id', communityId)
            .single();
            
          debug.communityName = communityData?.name;
          
          if (communityError) {
            debug.steps.push(`Error finding community: ${communityError.message}`);
            throw new Error(`Could not find community: ${communityError.message}`);
          }
          
          if (!communityData?.owner_id) {
            debug.steps.push('Community found but has no owner ID');
            throw new Error('Community has no owner');
          }
          
          debug.steps.push(`Found community: ${communityData.name}`);
          debug.steps.push(`Owner ID: ${communityData.owner_id}`);
          debug.ownerId = communityData.owner_id;
          
          setCommunityOwner(communityData.owner_id);
          
          // Then get payment method by owner_id
          const { data: paymentData, error: paymentError } = await supabase
            .from('payment_methods')
            .select('config, id')
            .eq('provider', 'crypto')
            .eq('owner_id', communityData.owner_id)
            .maybeSingle();
          
          debug.steps.push(`Looking for payment method with owner_id: ${communityData.owner_id}`);
          debug.steps.push(`Payment method found: ${paymentData ? 'Yes' : 'No'}`);
          debug.paymentMethodId = paymentData?.id;
          
          if (paymentError) {
            debug.steps.push(`Error finding payment method: ${paymentError.message}`);
            throw paymentError;
          }
          
          if (!paymentData) {
            debug.steps.push(`No crypto payment method found for owner: ${communityData.owner_id}`);
            throw new Error(`No crypto payment method found for community owner: ${communityData.owner_id}`);
          }
          
          debug.steps.push(`Config found: ${paymentData.config ? 'Yes' : 'No'}`);
          debug.hasConfig = !!paymentData.config;
          debug.hasApiKey = paymentData.config?.api_key ? 'Yes' : 'No';
          
          setConfig(paymentData.config || null);
        }
        
        setDebugInfo(debug);
      } catch (err) {
        console.error("Error fetching NOWPayments config:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch config";
        setError(errorMessage);
        
        // If debugging, include the error in debug info
        setDebugInfo(prev => ({
          ...prev,
          error: errorMessage
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  if (isLoading) {
    return (
      <div className="p-2 bg-gray-100 rounded flex items-center gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        <p className="text-xs">Loading NOWPayments config...</p>
      </div>
    );
  }
  
  const hasApiKey = config?.api_key && config.api_key.length > 0;
  const hasIpnUrl = config?.ipn_callback_url && config.ipn_callback_url.length > 0;
  
  return (
    <div className="p-2 bg-gray-100 rounded border border-gray-200 mb-2">
      <h4 className="text-xs font-semibold mb-1 flex items-center">
        <InfoIcon className="h-3 w-3 mr-1" />
        NOWPayments Config Debug
      </h4>
      
      {error ? (
        <div className="flex items-start text-xs text-red-600">
          <AlertCircle className="h-3 w-3 mr-1 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="space-y-1 text-xs">
          {communityOwner && (
            <div className="text-gray-600">
              Community Owner ID: {communityOwner?.substring(0, 8)}...
            </div>
          )}
          
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
          
          {/* Debug information section for development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <div className="font-semibold">Debug Steps:</div>
              <div className="text-xs space-y-0.5 ml-1">
                {debugInfo.steps?.map((step: string, i: number) => (
                  <div key={i} className="text-gray-600">{i+1}. {step}</div>
                ))}
              </div>
            </div>
          )}
          
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
