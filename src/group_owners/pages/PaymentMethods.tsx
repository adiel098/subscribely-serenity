
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Wallet, Bitcoin, Sparkles, Shield, Lock, Zap, LayoutGrid } from "lucide-react";
import { useCommunityContext } from '@/contexts/CommunityContext';
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodCard } from "@/group_owners/components/payments/PaymentMethodCard";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { motion } from "framer-motion";

const PaymentMethods = () => {
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();
  const { data: paymentMethods, refetch } = usePaymentMethods(selectedCommunityId);

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
    refetch();
  };

  const isMethodConfigured = (provider: string) => {
    const method = paymentMethods?.find(m => m.provider === provider);
    return method && Object.keys(method.config).length > 0;
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 py-6 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-left"
      >
        <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
          <Zap className="h-7 w-7 text-indigo-500" />
          Payment Methods
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">💰</span>
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Configure and manage your payment gateways for community subscriptions 💸
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center items-center p-4 pb-2 text-center"
      >
        <div className="flex flex-col items-center text-center max-w-lg">
          <Shield className="h-14 w-14 text-indigo-200 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Payment Settings Simplified</h3>
          <p className="text-gray-500 text-base">
            We've made payment configuration easier! Click on any payment method card below
            and use the "Configure" button to set up your payment gateway securely. 🔒
          </p>
        </div>
      </motion.div>

      <Card className="border-indigo-100 shadow-md bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden max-w-5xl mx-auto">
        <CardHeader className="pb-3 pt-6">
          <CardTitle className="flex items-center justify-center gap-3 text-xl">
            <LayoutGrid className="h-6 w-6 text-indigo-600" />
            Available Payment Gateways
          </CardTitle>
          <CardDescription className="text-center text-base">
            Enable and configure payment options for your members
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <motion.div 
            className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 mx-auto"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item} className="h-full w-full">
              <PaymentMethodCard
                title="Stripe"
                description="Accept credit card payments securely with Stripe 💳"
                icon={CreditCard}
                isActive={paymentMethods?.some(m => m.provider === 'stripe' && m.is_active) ?? false}
                onToggle={(active) => handleMethodToggle('stripe', active)}
                isConfigured={isMethodConfigured('stripe')}
                onConfigure={() => {}}
                imageSrc="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png"
                provider="stripe"
                communityId={selectedCommunityId || ""}
              />
            </motion.div>
            <motion.div variants={item} className="h-full w-full">
              <PaymentMethodCard
                title="PayPal"
                description="Accept PayPal payments easily and securely 🔄"
                icon={Wallet}
                isActive={paymentMethods?.some(m => m.provider === 'paypal' && m.is_active) ?? false}
                onToggle={(active) => handleMethodToggle('paypal', active)}
                isConfigured={isMethodConfigured('paypal')}
                onConfigure={() => {}}
                imageSrc="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png"
                provider="paypal"
                communityId={selectedCommunityId || ""}
              />
            </motion.div>
            <motion.div variants={item} className="h-full w-full">
              <PaymentMethodCard
                title="Crypto"
                description="Accept cryptocurrency payments for your groups 🪙"
                icon={Bitcoin}
                isActive={paymentMethods?.some(m => m.provider === 'crypto' && m.is_active) ?? false}
                onToggle={(active) => handleMethodToggle('crypto', active)}
                isConfigured={isMethodConfigured('crypto')}
                onConfigure={() => {}}
                imageSrc="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png"
                provider="crypto"
                communityId={selectedCommunityId || ""}
              />
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethods;
