import { useState } from 'react'
import { DashboardLayout } from '@/group_owners/components/DashboardLayout'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useProjectContext } from '@/contexts/ProjectContext'
import { PaymentMethodCard } from '@/group_owners/components/payment-methods/PaymentMethodCard'
import { PaymentMethodForm } from '@/group_owners/components/payment-methods/PaymentMethodForm'
import { CreditCard, ExternalLink, Check, DollarSign, CreditCardIcon, Loader2, LayoutGrid, Wallet, Bitcoin, Sparkles } from 'lucide-react'
import { usePaymentMethods } from '@/group_owners/hooks/usePaymentMethods'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePaymentMethodsPage } from '@/group_owners/hooks/usePaymentMethodsPage'

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
  
  let authData = { user: null };
  try {
    authData = useAuth();
  } catch (error) {
    console.warn("Auth provider not available, continuing with null user");
  }
  const { user } = authData;
  
  const isMobile = useIsMobile();

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
  
  console.log("Payment methods available:", paymentMethods);
  
  // Ensure crypto is always included
  const displayMethods = paymentMethods ? [...paymentMethods] : [];
  const hasCrypto = displayMethods.some(m => m.provider === 'crypto');
  
  if (!hasCrypto && user?.id) {
    // Add crypto if it doesn't exist
    displayMethods.push({
      id: 'virtual-crypto-id',
      provider: 'crypto',
      is_active: false,
      config: {},
      owner_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  if (isLoading) {
    return <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-lg text-gray-600">Loading payment methods...</p>
      </div>;
  }
  
  return (
    <div className="w-full">
      <div className="space-y-6">
        <motion.div className="flex items-start" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
              <CreditCard className={`h-${isMobile ? '6' : '8'} w-${isMobile ? '6' : '8'} text-indigo-600`} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Payment Methods <Sparkles className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'} inline text-amber-400`} />
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Configure and manage payment gateways for all your communities and groups 💸
              </p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="all" className="max-w-5xl mx-auto">
          <Card className="border-indigo-100 shadow-md bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden mx-auto max-w-4xl">
            <CardHeader className={`${isMobile ? 'p-3 pb-2' : 'pb-3 pt-6'}`}>
              <CardTitle className={`flex items-center justify-center gap-2 md:gap-3 text-${isMobile ? 'base' : 'lg'} md:text-xl`}>
                <LayoutGrid className={`h-${isMobile ? '4' : '5'} w-${isMobile ? '4' : '5'} md:h-6 md:w-6 text-indigo-600`} />
                Available Payment Gateways
              </CardTitle>
              <CardDescription className="text-center text-xs md:text-sm lg:text-base">
                Enable and configure global payment options for all your communities and groups
              </CardDescription>
            </CardHeader>
            <CardContent className={`${isMobile ? 'p-2 pb-3' : 'pb-4'}`}>
              <TabsContent value="all" className="mt-0">
                <motion.div 
                  className={`grid gap-${isMobile ? '4' : '8'} ${isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'sm:grid-cols-1 md:grid-cols-3'} mx-auto justify-center`} 
                  variants={container} 
                  initial="hidden" 
                  animate="show"
                >
                  {!displayMethods || displayMethods.length === 0 ? (
                    <div className="col-span-3 py-10 text-center">
                      <motion.div variants={item} className="flex flex-col items-center gap-4">
                        <CreditCard className="h-16 w-16 text-gray-300" />
                        <h3 className="text-xl font-medium text-gray-500">No payment methods available</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          Please refresh the page to load payment methods. If this problem persists, contact support.
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <>
                      {displayMethods.some(m => m.provider === 'stripe') && (
                        <motion.div variants={item} className="h-full w-full">
                          <PaymentMethodCard 
                            title="Stripe" 
                            description="Accept credit card payments securely with Stripe 💳" 
                            icon={CreditCard} 
                            isActive={displayMethods?.find(m => m.provider === 'stripe')?.is_active ?? false} 
                            onToggle={active => handleTogglePaymentMethod(displayMethods?.find(m => m.provider === 'stripe')?.id || '', active)} 
                            isConfigured={Object.keys(displayMethods?.find(m => m.provider === 'stripe')?.config || {}).length > 0} 
                            onConfigure={() => {}} 
                            imageSrc="/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png" 
                            provider="stripe"
                            ownerId={displayMethods?.find(m => m.provider === 'stripe')?.owner_id}
                          />
                        </motion.div>
                      )}
                      
                      {displayMethods.some(m => m.provider === 'paypal') && (
                        <motion.div variants={item} className="h-full w-full">
                          <PaymentMethodCard 
                            title="PayPal" 
                            description="Accept PayPal payments easily and securely 🔄" 
                            icon={Wallet} 
                            isActive={displayMethods?.find(m => m.provider === 'paypal')?.is_active ?? false} 
                            onToggle={active => handleTogglePaymentMethod(displayMethods?.find(m => m.provider === 'paypal')?.id || '', active)} 
                            isConfigured={Object.keys(displayMethods?.find(m => m.provider === 'paypal')?.config || {}).length > 0} 
                            onConfigure={() => {}} 
                            imageSrc="/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png" 
                            provider="paypal"
                            ownerId={displayMethods?.find(m => m.provider === 'paypal')?.owner_id}
                          />
                        </motion.div>
                      )}
                      
                      {displayMethods.some(m => m.provider === 'crypto') && (
                        <motion.div variants={item} className="h-full w-full">
                          <PaymentMethodCard 
                            title="Cryptocurrency" 
                            description="Accept cryptocurrency payments via NOWPayments 🪙" 
                            icon={Bitcoin} 
                            isActive={displayMethods?.find(m => m.provider === 'crypto')?.is_active ?? false} 
                            onToggle={active => handleTogglePaymentMethod(displayMethods?.find(m => m.provider === 'crypto')?.id || '', active)} 
                            isConfigured={Object.keys(displayMethods?.find(m => m.provider === 'crypto')?.config || {}).length > 0} 
                            onConfigure={() => {}} 
                            imageSrc="/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png" 
                            provider="crypto"
                            ownerId={displayMethods?.find(m => m.provider === 'crypto')?.owner_id}
                          />
                        </motion.div>
                      )}
                    </>
                  )}
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
