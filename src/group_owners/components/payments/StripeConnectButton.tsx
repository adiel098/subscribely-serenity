
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, RefreshCw, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

interface StripeConnectButtonProps {
  ownerId?: string;
  onSuccess?: () => void;
  stripeConfig?: any;
  className?: string;
}

export const StripeConnectButton: React.FC<StripeConnectButtonProps> = ({
  ownerId,
  onSuccess,
  stripeConfig,
  className
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  const userId = ownerId || user?.id;

  useEffect(() => {
    if (stripeConfig?.stripe_account_id && stripeConfig?.is_connected) {
      setAccountInfo({
        accountId: stripeConfig.stripe_account_id,
        connectedAt: stripeConfig.connected_at
      });
    }
  }, [stripeConfig]);

  const handleConnect = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to connect your Stripe account",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Redirect to the Stripe Connect authorization flow
      window.location.href = `${window.location.origin}/functions/v1/stripe-connect/authorize?user_id=${userId}`;
    } catch (error) {
      console.error("Error initiating Stripe Connect:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Stripe. Please try again later.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({
          config: {
            is_connected: false,
            disconnected_at: new Date().toISOString()
          },
          is_active: false
        })
        .eq('owner_id', userId)
        .eq('provider', 'stripe');

      if (error) throw error;

      setAccountInfo(null);
      toast({
        title: "Stripe Disconnected",
        description: "Your Stripe account has been disconnected successfully",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error disconnecting Stripe:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect your Stripe account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (accountInfo) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <div>
              <h3 className="font-medium text-green-800">Stripe Account Connected</h3>
              <p className="text-green-700 text-sm">
                Your Stripe account is successfully connected and ready to process payments.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Account ID: {accountInfo.accountId?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
          onClick={handleDisconnect}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Disconnect Stripe Account
        </Button>
      </div>
    );
  }

  return (
    <Button
      className={`bg-[#635bff] hover:bg-[#726deb] gap-2 ${className || ""}`}
      onClick={handleConnect}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg 
          className="h-4 w-4" 
          viewBox="0 0 40 40" 
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M35 0H5C2.25 0 0 2.25 0 5v30c0 2.75 2.25 5 5 5h30c2.75 0 5-2.25 5-5V5c0-2.75-2.25-5-5-5zM15 31.25c0 .5-.25.75-.75.75h-5c-.5 0-.75-.25-.75-.75V22.5h-3c-.5 0-.75-.25-.75-.75V18c0-.5.25-.75.75-.75h3v-3.25c0-2.75 1.5-6.25 5.75-6.25h4c.5 0 .75.25.75.75v3.75c0 .5-.25.75-.75.75h-2.5c-1 0-1.5.75-1.5 1.75V17.25h4.25c.5 0 .75.25.75.75l-.5 3.75c0 .5-.5.75-1 .75H14.25v8.75h.75zm15.75-6.75c-2.25 0-4-1.75-4-4s1.75-4 4-4 4 1.75 4 4-1.75 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      )}
      Connect with Stripe
    </Button>
  );
};
