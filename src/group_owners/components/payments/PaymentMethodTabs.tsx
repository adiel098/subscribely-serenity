
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Bitcoin, Shield, Loader2, Key, LockKeyhole, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface PaymentMethodTabsProps {
  communityId: string;
  activeTab?: string;
}

interface StripeConfig {
  public_key: string;
  secret_key: string;
}

// Type guard to check if value is a StripeConfig
const isStripeConfig = (value: any): value is StripeConfig => {
  if (typeof value !== 'object' || value === null) return false;
  const config = value as Record<string, unknown>;
  return typeof config.public_key === 'string' && typeof config.secret_key === 'string';
};

export const PaymentMethodTabs = ({ communityId, activeTab = "stripe" }: PaymentMethodTabsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [currentTab, setCurrentTab] = useState(activeTab);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Fetch existing keys when component mounts
  useEffect(() => {
    const fetchStripeKeys = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('config')
          .eq('community_id', communityId)
          .eq('provider', 'stripe')
          .single();

        if (error) {
          console.error('Error fetching Stripe config:', error);
          return;
        }

        if (data?.config && isStripeConfig(data.config)) {
          setStripePublicKey(data.config.public_key);
          setStripeSecretKey(data.config.secret_key);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (communityId) {
      fetchStripeKeys();
    }
  }, [communityId]);

  // Update the current tab when the activeTab prop changes
  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripePublicKey || !stripeSecretKey) {
      toast({
        title: "Error",
        description: "Please fill in both Stripe keys",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payment_methods')
        .upsert({
          community_id: communityId,
          provider: 'stripe',
          is_active: true,
          config: {
            public_key: stripePublicKey,
            secret_key: stripeSecretKey
          }
        }, {
          onConflict: 'community_id,provider'
        });

      if (error) throw error;

      toast({
        title: "Success ✅",
        description: "Stripe configuration has been saved",
      });

    } catch (error) {
      console.error('Error saving Stripe config:', error);
      toast({
        title: "Error",
        description: "Failed to save Stripe configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl shadow-sm mb-6">
        <TabsTrigger 
          value="stripe" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg flex items-center gap-2 py-3"
        >
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png" 
              alt="Stripe" 
              className="h-5 w-5 object-contain" 
            />
            Stripe
          </div>
        </TabsTrigger>
        <TabsTrigger 
          value="paypal" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg flex items-center gap-2 py-3"
        >
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png"
              alt="PayPal" 
              className="h-5 w-5 object-contain" 
            />
            PayPal
          </div>
        </TabsTrigger>
        <TabsTrigger 
          value="crypto" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg flex items-center gap-2 py-3"
        >
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png" 
              alt="Crypto" 
              className="h-5 w-5 object-contain" 
            />
            Crypto
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stripe" className="space-y-4">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 text-indigo-700">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <img 
                src="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png" 
                alt="Stripe" 
                className="h-7 w-7 object-contain" 
              />
            </div>
            <div>
              <h3 className="font-medium text-lg">Stripe API Configuration</h3>
              <p className="text-sm text-indigo-500">Securely process credit card payments</p>
            </div>
          </div>
          
          <form onSubmit={handleStripeSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="stripe-public" className="flex items-center gap-2 text-sm font-medium">
                <Key className="h-4 w-4 text-indigo-500" />
                Stripe Public Key
              </Label>
              <Input 
                id="stripe-public" 
                placeholder="pk_test_..." 
                value={stripePublicKey}
                onChange={(e) => setStripePublicKey(e.target.value)}
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
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                className="border-indigo-100 focus:border-indigo-300 shadow-sm"
              />
              <p className="text-xs text-muted-foreground">Your Stripe secret key starts with 'sk_'</p>
            </div>
            <div className="pt-3">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 flex items-center gap-2 shadow-md py-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving Configuration...
                  </>
                ) : (
                  <>
                    <img 
                      src="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png" 
                      alt="Stripe" 
                      className="h-5 w-5 object-contain bg-white rounded-full p-0.5" 
                    />
                    Save Stripe Configuration
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-5 flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Shield className="h-4 w-4" />
              <p className="text-sm">Your API keys are encrypted and stored securely</p>
            </div>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="paypal">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 text-blue-700">
            <div className="p-2 bg-blue-50 rounded-lg">
              <img 
                src="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png" 
                alt="PayPal" 
                className="h-7 w-7 object-contain" 
              />
            </div>
            <div>
              <h3 className="font-medium text-lg">PayPal Configuration</h3>
              <p className="text-sm text-blue-500">Accept payments via PayPal</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="paypal-client-id" className="flex items-center gap-2 text-sm font-medium">
                <Key className="h-4 w-4 text-blue-500" />
                PayPal Client ID
              </Label>
              <Input 
                id="paypal-client-id" 
                placeholder="Your PayPal client ID..." 
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
                className="border-blue-100 focus:border-blue-300 shadow-sm"
              />
            </div>
            <div className="pt-3">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center gap-2 shadow-md py-6">
                <img 
                  src="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png" 
                  alt="PayPal" 
                  className="h-5 w-5 object-contain bg-white rounded-full p-0.5" 
                />
                Save PayPal Configuration
              </Button>
            </div>
          </div>
          
          <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
            <Wallet className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">PayPal integration coming soon!</p>
              <p className="text-xs text-amber-600 mt-1">
                We're working hard to bring you PayPal integration. Stay tuned for updates! 🚀
              </p>
            </div>
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="crypto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 text-orange-700">
            <div className="p-2 bg-orange-50 rounded-lg">
              <img 
                src="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png" 
                alt="Crypto" 
                className="h-7 w-7 object-contain" 
              />
            </div>
            <div>
              <h3 className="font-medium text-lg">Cryptocurrency Configuration</h3>
              <p className="text-sm text-orange-500">Accept payments in cryptocurrency</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="crypto-wallet" className="flex items-center gap-2 text-sm font-medium">
                <Key className="h-4 w-4 text-orange-500" />
                Wallet Address
              </Label>
              <Input 
                id="crypto-wallet" 
                placeholder="Your crypto wallet address..." 
                className="border-orange-100 focus:border-orange-300 shadow-sm"
              />
              <p className="text-xs text-muted-foreground">Enter the wallet address where you want to receive payments</p>
            </div>
            <div className="pt-3">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 flex items-center gap-2 shadow-md py-6">
                <img 
                  src="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png" 
                  alt="Crypto" 
                  className="h-5 w-5 object-contain bg-white rounded-full p-0.5" 
                />
                Save Crypto Configuration
              </Button>
            </div>
          </div>
          
          <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
            <Bitcoin className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Cryptocurrency integration coming soon!</p>
              <p className="text-xs text-amber-600 mt-1">
                We're working on cryptocurrency payment integration. Support for Bitcoin, Ethereum, and more coming soon! 🪙
              </p>
            </div>
          </div>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};
