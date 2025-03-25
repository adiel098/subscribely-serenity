
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Wallet, Bitcoin, Sparkles, Shield, Lock, Zap, LayoutGrid, Loader2 } from "lucide-react";
import { useCommunityContext } from '@/contexts/CommunityContext';
import { PaymentMethodCard } from "@/group_owners/components/payments/PaymentMethodCard";
import { usePaymentMethodsPage } from "@/group_owners/hooks/usePaymentMethodsPage";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";

const PaymentMethods = () => {
  const {
    toast
  } = useToast();
  const {
    paymentMethods,
    isLoading,
    filter,
    setFilter,
    handleTogglePaymentMethod
  } = usePaymentMethodsPage();

  // Animation variants
  const container = {
    hidden: {
      opacity: 0
    },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  const item = {
    hidden: {
      opacity: 0,
      y: 20
    },
    show: {
      opacity: 1,
      y: 0
    }
  };
  if (isLoading) {
    return <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg text-gray-600">Loading payment methods...</p>
      </div>;
  }
  return (
    <div className="container px-0 py-4 max-w-5xl mx-auto">
      <div className="space-y-6 max-w-7xl px-0 py-0 my-[6px]">
        <motion.div className="flex items-center space-x-3" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
          <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
            <CreditCard className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Payment Methods <Sparkles className="h-5 w-5 inline text-amber-400" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure and manage payment gateways for all your communities and groups 💸
            </p>
          </div>
        </motion.div>

        <Tabs defaultValue="all" className="max-w-5xl mx-auto">
          <Card className="border-indigo-100 shadow-md bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden mx-auto max-w-4xl">
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
                <motion.div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 mx-auto justify-center" variants={container} initial="hidden" animate="show">
                  {!paymentMethods || paymentMethods.length === 0 ? <div className="col-span-3 py-10 text-center">
                      <motion.div variants={item} className="flex flex-col items-center gap-4">
                        <CreditCard className="h-16 w-16 text-gray-300" />
                        <h3 className="text-xl font-medium text-gray-500">No payment methods available</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          Please refresh the page to load payment methods. If this problem persists, contact support.
                        </p>
                      </motion.div>
                    </div> : <>
                      {paymentMethods.some(m => m.provider === 'stripe') && <motion.div variants={item} className="h-full w-full">
                          <PaymentMethodCard title="Stripe" description="Accept credit card payments securely with Stripe 💳" icon={CreditCard} isActive={paymentMethods?.find(m => m.provider === 'stripe')?.is_active ?? false} onToggle={active => handleTogglePaymentMethod(paymentMethods?.find(m => m.provider === 'stripe')?.id || '', active)} isConfigured={Object.keys(paymentMethods?.find(m => m.provider === 'stripe')?.config || {}).length > 0} onConfigure={() => {}} imageSrc="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png" provider="stripe" />
                        </motion.div>}
                      
                      {paymentMethods.some(m => m.provider === 'paypal') && <motion.div variants={item} className="h-full w-full">
                          <PaymentMethodCard title="PayPal" description="Accept PayPal payments easily and securely 🔄" icon={Wallet} isActive={paymentMethods?.find(m => m.provider === 'paypal')?.is_active ?? false} onToggle={active => handleTogglePaymentMethod(paymentMethods?.find(m => m.provider === 'paypal')?.id || '', active)} isConfigured={Object.keys(paymentMethods?.find(m => m.provider === 'paypal')?.config || {}).length > 0} onConfigure={() => {}} imageSrc="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png" provider="paypal" />
                        </motion.div>}
                      
                      {paymentMethods.some(m => m.provider === 'crypto') && <motion.div variants={item} className="h-full w-full">
                          <PaymentMethodCard title="Crypto" description="Accept cryptocurrency payments for your groups 🪙" icon={Bitcoin} isActive={paymentMethods?.find(m => m.provider === 'crypto')?.is_active ?? false} onToggle={active => handleTogglePaymentMethod(paymentMethods?.find(m => m.provider === 'crypto')?.id || '', active)} isConfigured={Object.keys(paymentMethods?.find(m => m.provider === 'crypto')?.config || {}).length > 0} onConfigure={() => {}} imageSrc="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png" provider="crypto" />
                        </motion.div>}
                    </>}
                </motion.div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};
export default PaymentMethods;
