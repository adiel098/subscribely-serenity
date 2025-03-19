
import { useState } from "react";
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
import { CreditCard, Wallet, Bitcoin, Sparkles, Shield, Lock, Zap, LayoutGrid } from "lucide-react";
import { useCommunityContext } from '@/contexts/CommunityContext';
import { PaymentMethodCard } from "@/group_owners/components/payments/PaymentMethodCard";
import { usePaymentMethodsPage } from "@/group_owners/hooks/usePaymentMethodsPage";
import { motion } from "framer-motion";

const PaymentMethods = () => {
  const { toast } = useToast();
  const { 
    paymentMethods, 
    isLoading, 
    filter, 
    setFilter,
    handleTogglePaymentMethod
  } = usePaymentMethodsPage();

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
          <TabsList>
            <TabsTrigger value="all" onClick={() => setFilter("all")}>All Payment Methods</TabsTrigger>
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
                {paymentMethods?.some(m => m.provider === 'stripe') ? (
                  <motion.div variants={item} className="h-full w-full">
                    <PaymentMethodCard
                      title="Stripe"
                      description="Accept credit card payments securely with Stripe 💳"
                      icon={CreditCard}
                      isActive={paymentMethods?.find(m => m.provider === 'stripe')?.is_active ?? false}
                      onToggle={(active) => handleTogglePaymentMethod(paymentMethods?.find(m => m.provider === 'stripe')?.id || '', active)}
                      isConfigured={Object.keys(paymentMethods?.find(m => m.provider === 'stripe')?.config || {}).length > 0}
                      onConfigure={() => {}}
                      imageSrc="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png"
                      provider="stripe"
                    />
                  </motion.div>
                ) : null}
                
                {paymentMethods?.some(m => m.provider === 'paypal') ? (
                  <motion.div variants={item} className="h-full w-full">
                    <PaymentMethodCard
                      title="PayPal"
                      description="Accept PayPal payments easily and securely 🔄"
                      icon={Wallet}
                      isActive={paymentMethods?.find(m => m.provider === 'paypal')?.is_active ?? false}
                      onToggle={(active) => handleTogglePaymentMethod(paymentMethods?.find(m => m.provider === 'paypal')?.id || '', active)}
                      isConfigured={Object.keys(paymentMethods?.find(m => m.provider === 'paypal')?.config || {}).length > 0}
                      onConfigure={() => {}}
                      imageSrc="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png"
                      provider="paypal"
                    />
                  </motion.div>
                ) : null}
                
                {paymentMethods?.some(m => m.provider === 'crypto') ? (
                  <motion.div variants={item} className="h-full w-full">
                    <PaymentMethodCard
                      title="Crypto"
                      description="Accept cryptocurrency payments for your groups 🪙"
                      icon={Bitcoin}
                      isActive={paymentMethods?.find(m => m.provider === 'crypto')?.is_active ?? false}
                      onToggle={(active) => handleTogglePaymentMethod(paymentMethods?.find(m => m.provider === 'crypto')?.id || '', active)}
                      isConfigured={Object.keys(paymentMethods?.find(m => m.provider === 'crypto')?.config || {}).length > 0}
                      onConfigure={() => {}}
                      imageSrc="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png"
                      provider="crypto"
                    />
                  </motion.div>
                ) : null}
                
                {paymentMethods?.length === 0 && (
                  <div className="col-span-3 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
                    No payment methods configured yet
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
