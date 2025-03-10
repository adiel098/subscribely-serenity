
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, LockKeyhole, Loader2, Shield, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentMethodConfigProps {
  provider: string;
  communityId: string;
  onSuccess: () => void;
  imageSrc?: string;
}

interface StripeConfig {
  public_key: string;
  secret_key: string;
}

interface PaypalConfig {
  client_id: string;
  secret: string;
}

interface CryptoConfig {
  wallet_address: string;
}

type ConfigType = StripeConfig | PaypalConfig | CryptoConfig;

export const PaymentMethodConfig = ({ 
  provider, 
  communityId, 
  onSuccess,
  imageSrc 
}: PaymentMethodConfigProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<ConfigType>({} as ConfigType);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('config')
          .eq('community_id', communityId)
          .eq('provider', provider)
          .single();

        if (error) {
          console.error(`Error fetching ${provider} config:`, error);
          return;
        }

        if (data?.config) {
          setConfig(data.config as ConfigType);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (communityId) {
      fetchConfig();
    }
  }, [communityId, provider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate config based on provider
    let isValid = false;
    
    if (provider === 'stripe') {
      const stripeConfig = config as StripeConfig;
      isValid = !!stripeConfig.public_key && !!stripeConfig.secret_key;
      if (!isValid) {
        toast({
          title: "Missing information",
          description: "Please fill in both Stripe keys",
          variant: "destructive",
        });
        return;
      }
    } else if (provider === 'paypal') {
      const paypalConfig = config as PaypalConfig;
      isValid = !!paypalConfig.client_id && !!paypalConfig.secret;
      if (!isValid) {
        toast({
          title: "Missing information",
          description: "Please fill in both PayPal credentials",
          variant: "destructive",
        });
        return;
      }
    } else if (provider === 'crypto') {
      const cryptoConfig = config as CryptoConfig;
      isValid = !!cryptoConfig.wallet_address;
      if (!isValid) {
        toast({
          title: "Missing information",
          description: "Please enter a wallet address",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .upsert({
          community_id: communityId,
          provider: provider,
          is_active: true,
          config: config
        }, {
          onConflict: 'community_id,provider'
        });

      if (error) throw error;

      toast({
        title: "Configuration saved",
        description: `Your ${provider} payment method has been configured successfully`,
        variant: "default",
      });
      
      onSuccess();
    } catch (error) {
      console.error(`Error saving ${provider} config:`, error);
      toast({
        title: "Error",
        description: `Failed to save ${provider} configuration`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const renderStripeConfig = () => {
    const stripeConfig = config as StripeConfig;
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="stripe-public" className="flex items-center gap-2 text-sm font-medium">
            <Key className="h-4 w-4 text-indigo-500" />
            Stripe Public Key
          </Label>
          <Input 
            id="stripe-public" 
            placeholder="pk_test_..." 
            value={stripeConfig.public_key || ''}
            onChange={(e) => handleChange('public_key', e.target.value)}
            className="border-indigo-100 focus:border-indigo-300 shadow-sm"
          />
          <p className="text-xs text-muted-foreground">Your Stripe publishable key starts with 'pk_'</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="stripe-secret" className="flex items-center gap-2 text-sm font-medium">
            <LockKeyhole className="h-4 w-4 text-indigo-500" />
            Stripe Secret Key
          </Label>
          <Input 
            id="stripe-secret" 
            type="password" 
            placeholder="sk_test_..." 
            value={stripeConfig.secret_key || ''}
            onChange={(e) => handleChange('secret_key', e.target.value)}
            className="border-indigo-100 focus:border-indigo-300 shadow-sm"
          />
          <p className="text-xs text-muted-foreground">Your Stripe secret key starts with 'sk_'</p>
        </div>
      </motion.div>
    );
  };

  const renderPaypalConfig = () => {
    const paypalConfig = config as PaypalConfig;
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="paypal-client-id" className="flex items-center gap-2 text-sm font-medium">
            <Key className="h-4 w-4 text-blue-500" />
            PayPal Client ID
          </Label>
          <Input 
            id="paypal-client-id" 
            placeholder="Your PayPal client ID..." 
            value={paypalConfig.client_id || ''}
            onChange={(e) => handleChange('client_id', e.target.value)}
            className="border-blue-100 focus:border-blue-300 shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paypal-secret" className="flex items-center gap-2 text-sm font-medium">
            <LockKeyhole className="h-4 w-4 text-blue-500" />
            PayPal Secret
          </Label>
          <Input 
            id="paypal-secret" 
            type="password" 
            placeholder="Your PayPal secret..." 
            value={paypalConfig.secret || ''}
            onChange={(e) => handleChange('secret', e.target.value)}
            className="border-blue-100 focus:border-blue-300 shadow-sm"
          />
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700">PayPal integration is in beta</p>
            <p className="text-xs text-amber-600 mt-1">
              PayPal integration is currently in beta testing. Some features may be limited.
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCryptoConfig = () => {
    const cryptoConfig = config as CryptoConfig;
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="crypto-wallet" className="flex items-center gap-2 text-sm font-medium">
            <Key className="h-4 w-4 text-orange-500" />
            Wallet Address
          </Label>
          <Input 
            id="crypto-wallet" 
            placeholder="Your crypto wallet address..." 
            value={cryptoConfig.wallet_address || ''}
            onChange={(e) => handleChange('wallet_address', e.target.value)}
            className="border-orange-100 focus:border-orange-300 shadow-sm"
          />
          <p className="text-xs text-muted-foreground">Enter the wallet address where you want to receive payments</p>
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700">Cryptocurrency integration is in beta</p>
            <p className="text-xs text-amber-600 mt-1">
              Cryptocurrency payment integration is currently in beta testing. Support for Bitcoin, Ethereum, and more coming soon!
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderProviderConfig = () => {
    switch (provider) {
      case 'stripe':
        return renderStripeConfig();
      case 'paypal':
        return renderPaypalConfig();
      case 'crypto':
        return renderCryptoConfig();
      default:
        return <p>Unknown provider</p>;
    }
  };

  // Get button color based on provider
  const getButtonClasses = () => {
    switch (provider) {
      case 'stripe':
        return "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800";
      case 'paypal':
        return "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800";
      case 'crypto':
        return "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600";
      default:
        return "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {renderProviderConfig()}
      
      <div className="pt-3">
        <Button 
          type="submit" 
          className={`w-full ${getButtonClasses()} flex items-center gap-2 shadow-md py-6`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving Configuration...
            </>
          ) : (
            <>
              {imageSrc && (
                <img 
                  src={imageSrc} 
                  alt={provider} 
                  className="h-5 w-5 object-contain bg-white rounded-full p-0.5" 
                />
              )}
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Save Configuration
            </>
          )}
        </Button>
      </div>
      
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-center gap-2 text-blue-700">
          <Shield className="h-4 w-4" />
          <p className="text-sm">Your API keys are encrypted and stored securely</p>
        </div>
        <RefreshCw className="h-4 w-4 text-blue-500" />
      </div>
    </form>
  );
};
