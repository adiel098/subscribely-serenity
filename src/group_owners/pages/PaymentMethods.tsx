
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CreditCard, Wallet, Bitcoin, Sparkles, Shield, Lock, Zap, LayoutGrid, Star, Filter, AlertCircle } from "lucide-react";
import { useCommunityContext } from '@/contexts/CommunityContext';
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodCard } from "@/group_owners/components/payments/PaymentMethodCard";
import { usePaymentMethods } from "@/group_owners/hooks/usePaymentMethods";
import { motion } from "framer-motion";

const PaymentMethods = () => {
  const { toast } = useToast();
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const { data: paymentMethods, refetch: refetchMethods } = usePaymentMethods();
  const [filter, setFilter] = useState<"all" | "default">("all");
  const [defaultMethods, setDefaultMethods] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available payment methods
    const fetchDefaultPaymentMethods = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('is_default', true);
        
        if (error) {
          console.error("Error fetching default payment methods:", error);
          return;
        }
        
        setDefaultMethods(data || []);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    
    fetchDefaultPaymentMethods();
  }, []);

  const handleMethodToggle = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: active })
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment method status"
      });
    } else {
      toast({
        title: "Successfully updated",
        description: `Payment method ${active ? 'enabled' : 'disabled'}`
      });
    }
    refetchMethods();
  };

  const handleDefaultToggle = async (id: string, isDefault: boolean) => {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: isDefault })
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update default settings"
      });
    } else {
      toast({
        title: "Successfully updated",
        description: isDefault 
          ? `Payment method set as default for all your communities` 
          : `Payment method is no longer a default payment method`
      });
    }
    refetchMethods();
  };

  const isMethodConfigured = (provider: string) => {
    const method = paymentMethods?.find(m => m.provider === provider);
    return method && Object.keys(method.config || {}).length > 0;
  };

  const getFilteredMethods = () => {
    if (!paymentMethods) return [];
    
    switch (filter) {
      case "default":
        return paymentMethods.filter(m => m.is_default);
      default:
        return paymentMethods;
    }
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
    <div className="space-y-4 py-6 animate-fade-in">
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
          Configure and manage payment gateways for all your communities and groups 💸
        </p>
      </motion.div>

      <Tabs defaultValue="all" className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid grid-cols-2 w-40">
            <TabsTrigger value="all" onClick={() => setFilter("all")}>All</TabsTrigger>
            <TabsTrigger value="default" onClick={() => setFilter("default")}>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                Default
              </div>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <Card className="border-indigo-100 shadow-md bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="flex items-center justify-center gap-3 text-xl">
              <LayoutGrid className="h-6 w-6 text-indigo-600" />
              Available Payment Gateways
            </CardTitle>
            <CardDescription className="text-center text-base">
              Enable and configure global payment options for all your communities and groups
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <TabsContent value="all" className="mt-0">
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
                    onToggle={(active) => handleMethodToggle(paymentMethods?.find(m => m.provider === 'stripe')?.id || '', active)}
                    isConfigured={isMethodConfigured('stripe')}
                    onConfigure={() => {}}
                    imageSrc="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png"
                    provider="stripe"
                    isDefault={paymentMethods?.some(m => m.provider === 'stripe' && m.is_default) ?? false}
                    onDefaultToggle={(isDefault) => handleDefaultToggle(paymentMethods?.find(m => m.provider === 'stripe')?.id || '', isDefault)}
                  />
                </motion.div>
                <motion.div variants={item} className="h-full w-full">
                  <PaymentMethodCard
                    title="PayPal"
                    description="Accept PayPal payments easily and securely 🔄"
                    icon={Wallet}
                    isActive={paymentMethods?.some(m => m.provider === 'paypal' && m.is_active) ?? false}
                    onToggle={(active) => handleMethodToggle(paymentMethods?.find(m => m.provider === 'paypal')?.id || '', active)}
                    isConfigured={isMethodConfigured('paypal')}
                    onConfigure={() => {}}
                    imageSrc="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png"
                    provider="paypal"
                    isDefault={paymentMethods?.some(m => m.provider === 'paypal' && m.is_default) ?? false}
                    onDefaultToggle={(isDefault) => handleDefaultToggle(paymentMethods?.find(m => m.provider === 'paypal')?.id || '', isDefault)}
                  />
                </motion.div>
                <motion.div variants={item} className="h-full w-full">
                  <PaymentMethodCard
                    title="Crypto"
                    description="Accept cryptocurrency payments for your groups 🪙"
                    icon={Bitcoin}
                    isActive={paymentMethods?.some(m => m.provider === 'crypto' && m.is_active) ?? false}
                    onToggle={(active) => handleMethodToggle(paymentMethods?.find(m => m.provider === 'crypto')?.id || '', active)}
                    isConfigured={isMethodConfigured('crypto')}
                    onConfigure={() => {}}
                    imageSrc="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png"
                    provider="crypto"
                    isDefault={paymentMethods?.some(m => m.provider === 'crypto' && m.is_default) ?? false}
                    onDefaultToggle={(isDefault) => handleDefaultToggle(paymentMethods?.find(m => m.provider === 'crypto')?.id || '', isDefault)}
                  />
                </motion.div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="default" className="mt-0">
              <motion.div 
                className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 mx-auto"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {getFilteredMethods().length > 0 ? (
                  getFilteredMethods().map((method) => (
                    <motion.div key={method.provider} variants={item} className="h-full w-full">
                      <PaymentMethodCard
                        title={method.provider.charAt(0).toUpperCase() + method.provider.slice(1)}
                        description={
                          method.provider === 'stripe' ? "Accept credit card payments securely with Stripe 💳" :
                          method.provider === 'paypal' ? "Accept PayPal payments easily and securely 🔄" :
                          "Accept cryptocurrency payments for your groups 🪙"
                        }
                        icon={
                          method.provider === 'stripe' ? CreditCard :
                          method.provider === 'paypal' ? Wallet :
                          Bitcoin
                        }
                        isActive={method.is_active}
                        onToggle={(active) => handleMethodToggle(method.id, active)}
                        isConfigured={Object.keys(method.config || {}).length > 0}
                        onConfigure={() => {}}
                        imageSrc={
                          method.provider === 'stripe' ? "/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png" :
                          method.provider === 'paypal' ? "/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png" :
                          "/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png"
                        }
                        provider={method.provider}
                        isDefault={method.is_default}
                        onDefaultToggle={(isDefault) => handleDefaultToggle(method.id, isDefault)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
                    No default payment methods have been set
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center items-center pt-1 pb-3 text-center"
      >
        <div className="flex flex-col items-center text-center max-w-lg">
          <Shield className="h-14 w-14 text-indigo-200 mb-3" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Unified Payment Settings</h3>
          <p className="text-gray-500 text-base">
            All payment methods configured here will be available across all your communities and groups.
            This unified approach ensures consistent payment options throughout your platform. 🔒
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentMethods;
