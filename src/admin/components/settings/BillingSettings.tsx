
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  CreditCard, 
  Save, 
  Wallet, 
  Bitcoin,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethodConfig {
  provider: string;
  is_active: boolean;
  config: Record<string, string>;
}

export function BillingSettings() {
  const [activeTab, setActiveTab] = useState("stripe");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);

  // Stripe config
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeActive, setStripeActive] = useState(false);

  // PayPal config
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalSecretKey, setPaypalSecretKey] = useState("");
  const [paypalActive, setPaypalActive] = useState(false);

  // Crypto config
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState("");
  const [cryptoActive, setCryptoActive] = useState(false);

  const { toast } = useToast();

  // Fetch payment methods on mount
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('platform_payment_methods')
          .select('*');

        if (error) {
          console.error('Error fetching payment methods:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load payment methods"
          });
          return;
        }

        if (data) {
          setPaymentMethods(data);
          
          // Set initial values for each payment method
          data.forEach(method => {
            if (method.provider === 'stripe') {
              setStripeActive(method.is_active || false);
              setStripePublicKey(method.config?.public_key || "");
              setStripeSecretKey(method.config?.secret_key || "");
            } else if (method.provider === 'paypal') {
              setPaypalActive(method.is_active || false);
              setPaypalClientId(method.config?.client_id || "");
              setPaypalSecretKey(method.config?.secret_key || "");
            } else if (method.provider === 'crypto') {
              setCryptoActive(method.is_active || false);
              setCryptoWalletAddress(method.config?.wallet_address || "");
            }
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [toast]);

  const handleSavePaymentMethod = async (provider: string) => {
    setIsSaving(true);
    
    let config = {};
    
    // Prepare config based on provider
    if (provider === 'stripe') {
      if (!stripePublicKey || !stripeSecretKey) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields for Stripe"
        });
        setIsSaving(false);
        return;
      }
      config = { public_key: stripePublicKey, secret_key: stripeSecretKey };
    } else if (provider === 'paypal') {
      if (!paypalClientId || !paypalSecretKey) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in all required fields for PayPal"
        });
        setIsSaving(false);
        return;
      }
      config = { client_id: paypalClientId, secret_key: paypalSecretKey };
    } else if (provider === 'crypto') {
      if (!cryptoWalletAddress) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please fill in wallet address for Crypto"
        });
        setIsSaving(false);
        return;
      }
      config = { wallet_address: cryptoWalletAddress };
    }

    try {
      // Check if payment method already exists
      const existingMethodIndex = paymentMethods.findIndex(m => m.provider === provider);
      
      if (existingMethodIndex >= 0) {
        // Update existing method
        const { error } = await supabase
          .from('platform_payment_methods')
          .update({
            is_active: provider === 'stripe' ? stripeActive : 
                      provider === 'paypal' ? paypalActive : 
                      cryptoActive,
            config: config
          })
          .eq('provider', provider);

        if (error) throw error;
      } else {
        // Insert new method
        const { error } = await supabase
          .from('platform_payment_methods')
          .insert({
            provider: provider,
            is_active: provider === 'stripe' ? stripeActive : 
                      provider === 'paypal' ? paypalActive : 
                      cryptoActive,
            config: config
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} payment method updated successfully`,
      });
    } catch (error) {
      console.error(`Error saving ${provider} settings:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to save ${provider} settings`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          Platform Payment Methods
        </CardTitle>
        <CardDescription>
          Configure and enable payment methods for platform subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Stripe
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              PayPal
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              Crypto
            </TabsTrigger>
          </TabsList>

          {/* Stripe Configuration */}
          <TabsContent value="stripe" className="space-y-4 mt-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-medium">Enable Stripe Payments</h3>
                <p className="text-sm text-muted-foreground">Allow users to pay with credit cards via Stripe</p>
              </div>
              <Switch 
                checked={stripeActive}
                onCheckedChange={setStripeActive}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="stripe-public-key">Public Key</Label>
                <Input
                  id="stripe-public-key"
                  placeholder="pk_test_..."
                  value={stripePublicKey}
                  onChange={(e) => setStripePublicKey(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stripe-secret-key">Secret Key</Label>
                <Input
                  id="stripe-secret-key"
                  type="password"
                  placeholder="sk_test_..."
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button 
                onClick={() => handleSavePaymentMethod('stripe')}
                disabled={isSaving || isLoading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Stripe Configuration
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* PayPal Configuration */}
          <TabsContent value="paypal" className="space-y-4 mt-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-medium">Enable PayPal Payments</h3>
                <p className="text-sm text-muted-foreground">Allow users to pay with PayPal</p>
              </div>
              <Switch 
                checked={paypalActive}
                onCheckedChange={setPaypalActive}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="paypal-client-id">Client ID</Label>
                <Input
                  id="paypal-client-id"
                  placeholder="Client ID..."
                  value={paypalClientId}
                  onChange={(e) => setPaypalClientId(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paypal-secret-key">Secret Key</Label>
                <Input
                  id="paypal-secret-key"
                  type="password"
                  placeholder="Secret Key..."
                  value={paypalSecretKey}
                  onChange={(e) => setPaypalSecretKey(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button 
                onClick={() => handleSavePaymentMethod('paypal')}
                disabled={isSaving || isLoading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save PayPal Configuration
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Crypto Configuration */}
          <TabsContent value="crypto" className="space-y-4 mt-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <h3 className="font-medium">Enable Crypto Payments</h3>
                <p className="text-sm text-muted-foreground">Allow users to pay with cryptocurrency</p>
              </div>
              <Switch 
                checked={cryptoActive}
                onCheckedChange={setCryptoActive}
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid gap-2">
                <Label htmlFor="crypto-wallet">Wallet Address</Label>
                <Input
                  id="crypto-wallet"
                  placeholder="Wallet address..."
                  value={cryptoWalletAddress}
                  onChange={(e) => setCryptoWalletAddress(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button 
                onClick={() => handleSavePaymentMethod('crypto')}
                disabled={isSaving || isLoading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Crypto Configuration
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
