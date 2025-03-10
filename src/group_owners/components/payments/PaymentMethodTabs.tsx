
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, Bitcoin, Shield, Loader2, Key, LockKeyhole } from "lucide-react";
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
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg flex items-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Stripe
        </TabsTrigger>
        <TabsTrigger 
          value="paypal" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg flex items-center gap-2"
        >
          <Wallet className="h-4 w-4" />
          PayPal
        </TabsTrigger>
        <TabsTrigger 
          value="crypto" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg flex items-center gap-2"
        >
          <Bitcoin className="h-4 w-4" />
          Crypto
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stripe" className="space-y-4">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4 text-indigo-700">
            <Shield className="h-5 w-5" />
            <h3 className="font-medium">Stripe API Configuration</h3>
          </div>
          
          <form onSubmit={handleStripeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripe-public" className="flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-500" />
                Stripe Public Key
              </Label>
              <Input 
                id="stripe-public" 
                placeholder="pk_test_..." 
                value={stripePublicKey}
                onChange={(e) => setStripePublicKey(e.target.value)}
                className="border-indigo-100 focus:border-indigo-300"
              />
              <p className="text-xs text-muted-foreground">Your Stripe publishable key starts with 'pk_'</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-secret" className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-indigo-500" />
                Stripe Secret Key
              </Label>
              <Input 
                id="stripe-secret" 
                type="password" 
                placeholder="sk_test_..." 
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                className="border-indigo-100 focus:border-indigo-300"
              />
              <p className="text-xs text-muted-foreground">Your Stripe secret key starts with 'sk_'</p>
            </div>
            <div className="pt-2">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Save Stripe Configuration
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </TabsContent>

      <TabsContent value="paypal">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4 text-indigo-700">
            <Wallet className="h-5 w-5" />
            <h3 className="font-medium">PayPal Configuration</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paypal-client-id" className="flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-500" />
                PayPal Client ID
              </Label>
              <Input 
                id="paypal-client-id" 
                placeholder="Your PayPal client ID..." 
                className="border-indigo-100 focus:border-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-secret" className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-indigo-500" />
                PayPal Secret
              </Label>
              <Input 
                id="paypal-secret" 
                type="password" 
                placeholder="Your PayPal secret..." 
                className="border-indigo-100 focus:border-indigo-300"
              />
            </div>
            <div className="pt-2">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Save PayPal Configuration
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-sm text-amber-700">
              PayPal integration will be available soon. Stay tuned! 🚀
            </p>
          </div>
        </motion.div>
      </TabsContent>

      <TabsContent value="crypto">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4 text-indigo-700">
            <Bitcoin className="h-5 w-5" />
            <h3 className="font-medium">Cryptocurrency Configuration</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="crypto-wallet" className="flex items-center gap-2">
                <Key className="h-4 w-4 text-indigo-500" />
                Wallet Address
              </Label>
              <Input 
                id="crypto-wallet" 
                placeholder="Your crypto wallet address..." 
                className="border-indigo-100 focus:border-indigo-300"
              />
            </div>
            <div className="pt-2">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                <Bitcoin className="h-4 w-4" />
                Save Crypto Configuration
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-sm text-amber-700">
              Cryptocurrency payment integration will be available soon. Stay tuned! 🪙
            </p>
          </div>
        </motion.div>
      </TabsContent>
    </Tabs>
  );
};
