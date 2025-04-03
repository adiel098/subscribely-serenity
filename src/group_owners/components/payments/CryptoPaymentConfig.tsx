
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, Copy, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CryptoPaymentConfigProps {
  ownerId?: string;
  onSuccess: () => void;
}

export const CryptoPaymentConfig = ({ 
  ownerId,
  onSuccess,
}: CryptoPaymentConfigProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({
    provider_type: 'manual',
    wallet_address: '',
    currency: 'BTC',
    merchant_id: '',
    ipn_secret: '',
    api_key: '',
    api_secret: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing configuration if available
  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const currentUserId = ownerId || user?.id;
        
        if (!currentUserId) {
          throw new Error("User is not authenticated");
        }
        
        const { data, error } = await supabase
          .from('payment_methods')
          .select('config')
          .eq('owner_id', currentUserId)
          .eq('provider', 'crypto')
          .maybeSingle();

        if (error) throw error;
        
        if (data && data.config) {
          // If provider_type is not present, default to 'manual' for backward compatibility
          const config = {
            provider_type: 'manual',
            ...data.config
          };
          setFormData(config);
        }
      } catch (err: any) {
        console.error('Error fetching configuration:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (ownerId || user?.id) {
      fetchConfig();
    } else {
      setError("Not authenticated. Please log in first.");
    }
  }, [ownerId, user?.id]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const currentUserId = ownerId || user?.id;
      
      if (!currentUserId) {
        throw new Error("User is not authenticated");
      }

      // Validate required fields based on provider type
      if (formData.provider_type === 'manual') {
        if (!formData.wallet_address || !formData.currency) {
          throw new Error("Wallet address and currency are required for manual payments");
        }
      } else if (formData.provider_type === 'coinpayments') {
        if (!formData.merchant_id || !formData.ipn_secret) {
          throw new Error("Merchant ID and IPN Secret are required for CoinPayments");
        }
      }

      console.log(`Saving crypto payment method for user: ${currentUserId}`);
      
      // Check if the payment method already exists
      const { data: existingMethods, error: checkError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('owner_id', currentUserId)
        .eq('provider', 'crypto');

      if (checkError) throw checkError;

      let result;
      
      if (existingMethods?.length) {
        // Update existing payment method
        result = await supabase
          .from('payment_methods')
          .update({ 
            config: formData,
            is_active: true,
          })
          .eq('owner_id', currentUserId)
          .eq('provider', 'crypto');
      } else {
        // Create new payment method
        result = await supabase
          .from('payment_methods')
          .insert({
            provider: 'crypto',
            config: formData,
            is_active: true,
            owner_id: currentUserId
          });
      }

      if (result.error) throw result.error;

      toast({
        title: "Crypto Payment Settings Saved",
        description: `Crypto payment settings have been saved successfully`,
        variant: "default",
      });

      // Call the success callback
      onSuccess();
    } catch (err: any) {
      console.error('Error saving configuration:', err);
      setError(err.message);
      
      toast({
        title: "Error Saving Settings",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    });
  };

  // Generate webhook URL for CoinPayments IPN
  const getWebhookUrl = () => {
    // Use your actual domain in production
    return `${window.location.origin}/api/coinpayments-webhook`;
  };

  if (!user?.id && !ownerId) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
        <p className="font-medium">Authentication required</p>
        <p className="text-sm">Please log in to configure payment methods.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider_type" className="text-base">
            Provider Type
          </Label>
          <Select 
            value={formData.provider_type} 
            onValueChange={(value) => handleSelectChange('provider_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select provider type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Wallet</SelectItem>
              <SelectItem value="coinpayments">CoinPayments</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            {formData.provider_type === 'manual' 
              ? 'Use your own wallet address for direct payments'
              : 'Use CoinPayments service to accept multiple cryptocurrencies'}
          </p>
        </div>

        {formData.provider_type === 'manual' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="wallet_address" className="text-base">
                Wallet Address
              </Label>
              <Input
                id="wallet_address"
                name="wallet_address"
                value={formData.wallet_address || ''}
                onChange={handleInputChange}
                required
                className="text-base border-indigo-100 focus:border-indigo-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-base">
                Currency
              </Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleSelectChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-4">
              <h4 className="font-semibold flex items-center gap-2 mb-1">
                <Info className="h-4 w-4" /> CoinPayments Setup Instructions
              </h4>
              <ol className="list-decimal ml-5 text-sm space-y-1">
                <li>Sign up or log in to your <a href="https://www.coinpayments.net/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">CoinPayments account</a></li>
                <li>Go to Account → API Keys to create API keys</li>
                <li>Go to Account → Account Settings → Merchant Settings to find your Merchant ID</li>
                <li>Set up an IPN Secret in the Merchant Settings</li>
                <li>Add the webhook URL below to your IPN settings</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant_id" className="text-base">
                Merchant ID
              </Label>
              <Input
                id="merchant_id"
                name="merchant_id"
                value={formData.merchant_id || ''}
                onChange={handleInputChange}
                required
                className="text-base border-indigo-100 focus:border-indigo-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipn_secret" className="text-base">
                IPN Secret
              </Label>
              <Input
                id="ipn_secret"
                name="ipn_secret"
                type="password"
                value={formData.ipn_secret || ''}
                onChange={handleInputChange}
                required
                className="text-base border-indigo-100 focus:border-indigo-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key" className="text-base">
                API Public Key
              </Label>
              <Input
                id="api_key"
                name="api_key"
                value={formData.api_key || ''}
                onChange={handleInputChange}
                className="text-base border-indigo-100 focus:border-indigo-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_secret" className="text-base">
                API Private Key
              </Label>
              <Input
                id="api_secret"
                name="api_secret"
                type="password"
                value={formData.api_secret || ''}
                onChange={handleInputChange}
                className="text-base border-indigo-100 focus:border-indigo-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">
                Webhook URL (IPN URL)
              </Label>
              <div className="flex">
                <Input
                  value={getWebhookUrl()}
                  readOnly
                  className="text-sm border-indigo-100 focus:border-indigo-300 bg-gray-50"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => copyToClipboard(getWebhookUrl(), "Webhook URL")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy URL</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add this URL to your CoinPayments IPN settings
              </p>
            </div>
          </>
        )}

        <Separator className="my-4" />
        
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg border bg-indigo-50/50 border-indigo-100"
        )}>
          <AlertCircle className="h-5 w-5 text-indigo-500" />
          <p className="text-sm text-indigo-700">
            These payment settings will apply to all your communities and groups
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving} 
          className="gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
