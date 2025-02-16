import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Wallet, Bitcoin, AlertCircle, ChevronRight, Check } from "lucide-react";
import { useCommunityContext } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal' | 'crypto';
  is_active: boolean;
  config: Record<string, any>;
}

const PaymentMethodCard = ({ 
  title, 
  description, 
  icon: Icon,
  isActive,
  onToggle,
  isConfigured,
  onConfigure
}: { 
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isActive: boolean;
  onToggle: (active: boolean) => void;
  isConfigured: boolean;
  onConfigure: () => void;
}) => (
  <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
        <Switch checked={isActive} onCheckedChange={onToggle} disabled={!isConfigured} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center space-x-2">
        {isConfigured ? (
          <div className="flex items-center text-sm text-green-600">
            <Check className="h-4 w-4 mr-1" />
            Configured
          </div>
        ) : (
          <div className="flex items-center text-sm text-amber-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            Configuration required
          </div>
        )}
      </div>
    </CardContent>
    <CardFooter>
      <Button
        variant="ghost"
        className="w-full justify-between group-hover:bg-primary/5 transition-colors"
        onClick={onConfigure}
      >
        Configure settings
        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </Button>
    </CardFooter>
  </Card>
);

const Messages = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("stripe");
  const { selectedCommunityId } = useCommunityContext();

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['payment-methods', selectedCommunityId],
    queryFn: async () => {
      if (!selectedCommunityId) return [];
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('community_id', selectedCommunityId);
        
      if (error) throw error;
      return data as PaymentMethod[];
    },
    enabled: !!selectedCommunityId
  });

  const handleMethodToggle = async (provider: string, active: boolean) => {
    if (!selectedCommunityId) return;

    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: active })
      .eq('community_id', selectedCommunityId)
      .eq('provider', provider);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment method status"
      });
    } else {
      toast({
        title: "Success",
        description: `${provider} payments ${active ? 'enabled' : 'disabled'}`
      });
    }
  };

  const isMethodConfigured = (provider: string) => {
    const method = paymentMethods?.find(m => m.provider === provider);
    return method && Object.keys(method.config).length > 0;
  };

  const handleConfigure = (provider: string) => {
    setActiveTab(provider);
  };

  return (
    <div className="container max-w-6xl py-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment Methods</h1>
        <p className="text-sm text-muted-foreground">
          Configure and manage your community payment methods
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <PaymentMethodCard
          title="Stripe"
          description="Accept credit card payments"
          icon={CreditCard}
          isActive={paymentMethods?.some(m => m.provider === 'stripe' && m.is_active) ?? false}
          onToggle={(active) => handleMethodToggle('stripe', active)}
          isConfigured={isMethodConfigured('stripe')}
          onConfigure={() => handleConfigure('stripe')}
        />
        <PaymentMethodCard
          title="PayPal"
          description="Accept PayPal payments"
          icon={Wallet}
          isActive={paymentMethods?.some(m => m.provider === 'paypal' && m.is_active) ?? false}
          onToggle={(active) => handleMethodToggle('paypal', active)}
          isConfigured={isMethodConfigured('paypal')}
          onConfigure={() => handleConfigure('paypal')}
        />
        <PaymentMethodCard
          title="Crypto"
          description="Accept cryptocurrency payments"
          icon={Bitcoin}
          isActive={paymentMethods?.some(m => m.provider === 'crypto' && m.is_active) ?? false}
          onToggle={(active) => handleMethodToggle('crypto', active)}
          isConfigured={isMethodConfigured('crypto')}
          onConfigure={() => handleConfigure('crypto')}
        />
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payment Method Configuration</CardTitle>
          <CardDescription>
            Configure your payment method settings and API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>
            <TabsContent value="stripe" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll need your Stripe API keys to enable credit card payments.
                </AlertDescription>
              </Alert>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-public">Stripe Public Key</Label>
                  <Input id="stripe-public" placeholder="pk_test_..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                  <Input id="stripe-secret" type="password" placeholder="sk_test_..." />
                </div>
                <Button>Save Stripe Configuration</Button>
              </div>
            </TabsContent>
            <TabsContent value="paypal" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your PayPal business account to accept PayPal payments.
                </AlertDescription>
              </Alert>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal-client">Client ID</Label>
                  <Input id="paypal-client" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paypal-secret">Client Secret</Label>
                  <Input id="paypal-secret" type="password" />
                </div>
                <Button>Save PayPal Configuration</Button>
              </div>
            </TabsContent>
            <TabsContent value="crypto" className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Set up cryptocurrency payment options for your community.
                </AlertDescription>
              </Alert>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-address">Wallet Address</Label>
                  <Input id="wallet-address" placeholder="Your crypto wallet address" />
                </div>
                <Button>Save Crypto Configuration</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
