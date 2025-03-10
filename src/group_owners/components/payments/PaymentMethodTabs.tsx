
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Json } from "@/integrations/supabase/types";

interface PaymentMethodTabsProps {
  communityId: string;
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

export const PaymentMethodTabs = ({ communityId }: PaymentMethodTabsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");

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
        title: "Success",
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
    <Tabs defaultValue="stripe" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl shadow-sm">
        <TabsTrigger 
          value="stripe" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg"
        >
          Stripe
        </TabsTrigger>
        <TabsTrigger 
          value="paypal" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 rounded-lg"
        >
          <Wallet className="mr-2 h-4 w-4" />
          PayPal
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stripe" className="space-y-4">
        <form onSubmit={handleStripeSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-public">Stripe Public Key</Label>
            <Input 
              id="stripe-public" 
              placeholder="pk_test_..." 
              value={stripePublicKey}
              onChange={(e) => setStripePublicKey(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
            <Input 
              id="stripe-secret" 
              type="password" 
              placeholder="sk_test_..." 
              value={stripeSecretKey}
              onChange={(e) => setStripeSecretKey(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Stripe Configuration'
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="paypal">
        <div className="space-y-4">
          {/* PayPal configuration content */}
        </div>
      </TabsContent>
    </Tabs>
  );
};
