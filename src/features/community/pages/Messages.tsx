import { useState } from "react";
import { useToast } from "@/features/community/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/features/community/components/ui/card";
import { CreditCard, Wallet, Bitcoin } from "lucide-react";
import { useCommunityContext } from '@/features/community/providers/CommunityContext';
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodCard } from "@/features/community/components/payments/PaymentMethodCard";
import { PaymentMethodTabs } from "@/features/community/components/payments/PaymentMethodTabs";
import { usePaymentMethods } from "@/hooks/community/usePaymentMethods";

const Messages = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("stripe");
  const { selectedCommunityId } = useCommunityContext();
  const { data: paymentMethods } = usePaymentMethods(selectedCommunityId);

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
          onConfigure={() => setActiveTab('stripe')}
        />
        <PaymentMethodCard
          title="PayPal"
          description="Accept PayPal payments"
          icon={Wallet}
          isActive={paymentMethods?.some(m => m.provider === 'paypal' && m.is_active) ?? false}
          onToggle={(active) => handleMethodToggle('paypal', active)}
          isConfigured={isMethodConfigured('paypal')}
          onConfigure={() => setActiveTab('paypal')}
        />
        <PaymentMethodCard
          title="Crypto"
          description="Accept cryptocurrency payments"
          icon={Bitcoin}
          isActive={paymentMethods?.some(m => m.provider === 'crypto' && m.is_active) ?? false}
          onToggle={(active) => handleMethodToggle('crypto', active)}
          isConfigured={isMethodConfigured('crypto')}
          onConfigure={() => setActiveTab('crypto')}
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
          <PaymentMethodTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
