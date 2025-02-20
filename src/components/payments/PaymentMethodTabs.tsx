
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Loader2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethodTabsProps {
  communityId: string;
}

export const PaymentMethodTabs = ({ communityId }: PaymentMethodTabsProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");

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
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stripe">
          <CreditCard className="mr-2 h-4 w-4" />
          Stripe
        </TabsTrigger>
        <TabsTrigger value="paypal">
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
