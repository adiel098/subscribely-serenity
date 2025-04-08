
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, InfoIcon } from "lucide-react";

export const NOWPaymentsDebugInfo: React.FC = () => {
  const [config, setConfig] = useState<any>(null);
  const [communityOwner, setCommunityOwner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Get community ID from URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const communityId = urlParams.get('communityId');
        
        if (!communityId) {
          console.log("No community ID found in URL, showing generic NOWPayments status");
          
          // Get config from any active crypto payment method
          const { data, error } = await supabase
            .from('payment_methods')
            .select('config, owner_id')
            .eq('provider', 'crypto')
            .eq('is_active', true)
            .maybeSingle();
            
          if (error) throw error;
          setConfig(data?.config || null);
          setCommunityOwner(data?.owner_id || null);
        } else {
          console.log(`Fetching NOWPayments config for community: ${communityId}`);
          
          // First get the community owner
          const { data: communityData, error: communityError } = await supabase
            .from('communities')
            .select('owner_id, name')
            .eq('id', communityId)
            .single();
            
          if (communityError) {
            throw new Error(`Could not find community: ${communityError.message}`);
          }
          
          setCommunityOwner(communityData?.owner_id || null);
          
          if (!communityData?.owner_id) {
            throw new Error('Community has no owner');
          }
          
          console.log(`Found community owner: ${communityData.owner_id} for community: ${communityData.name}`);
          
          // Then get payment method by owner_id
          const { data, error } = await supabase
            .from('payment_methods')
            .select('config')
            .eq('provider', 'crypto')
            .eq('is_active', true)
            .eq('owner_id', communityData.owner_id)
            .maybeSingle();
            
          if (error) throw error;
          
          console.log(`Fetched payment method for owner: ${communityData.owner_id}`, data);
          setConfig(data?.config || null);
        }
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
