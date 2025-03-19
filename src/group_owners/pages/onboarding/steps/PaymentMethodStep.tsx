
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/ui/button";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { CreditCard, ArrowRight, Check, Loader2, Wallet, Bitcoin } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingStep } from "@/group_owners/hooks/useOnboarding";
import { useActivePaymentMethods } from "@/group_owners/hooks/useActivePaymentMethods";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PaymentMethodConfig } from "@/group_owners/components/payments/PaymentMethodConfig";

interface PaymentMethodStepProps {
  goToNextStep: () => void;
  hasPaymentMethod: boolean;
  saveCurrentStep: (step: OnboardingStep) => Promise<void>;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  goToNextStep,
  hasPaymentMethod,
  saveCurrentStep
}) => {
  const { data: paymentMethods, isLoading, refetch } = useActivePaymentMethods();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  
  // Check payment methods when dialog closes
  useEffect(() => {
    if (!isConfigDialogOpen) {
      refetch();
      saveCurrentStep('payment-method');
    }
  }, [isConfigDialogOpen, refetch, saveCurrentStep]);
  
  const handleConfigurePaymentMethod = (provider: string) => {
    setSelectedProvider(provider);
    setIsConfigDialogOpen(true);
  };
  
  const getPaymentIcon = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return <CreditCard className="h-5 w-5 text-indigo-600" />;
      case 'paypal':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'crypto':
        return <Bitcoin className="h-5 w-5 text-amber-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getPaymentMethodImage = (provider: string) => {
    switch (provider) {
      case 'stripe':
        return "/lovable-uploads/12cd3116-48b5-476e-9651-67911ca3116a.png";
      case 'paypal':
        return "/lovable-uploads/780f23f9-a460-4b44-b9e8-f89fcbfe59d7.png";
      case 'crypto':
        return "/lovable-uploads/32e0bb5b-2a97-4edf-9afb-8ac446b31afd.png";
      default:
        return "";
    }
  };
  
  return (
    <OnboardingLayout
      currentStep="payment-method"
      title="Set Up Payment Methods"
      description="Configure how you'll accept payments from your members"
      icon={<CreditCard className="h-6 w-6" />}
    >
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : hasPaymentMethod || (paymentMethods && paymentMethods.some(pm => pm.is_active)) ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-5"
          >
            <div className="flex items-center gap-3 text-green-700">
              <div className="bg-green-500 text-white p-2 rounded-full">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Payment Methods Configured!</h3>
                <p>You've successfully set up your payment methods</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(paymentMethods || []).filter(pm => pm.is_active).map((method) => (
                <div key={method.id} className="bg-white rounded-lg p-3 border flex items-center gap-3">
                  {getPaymentIcon(method.provider)}
                  <span className="font-medium capitalize">{method.provider}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-amber-800">
              <p className="font-medium flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-amber-500" />
                Set up at least one payment method to start accepting payments
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['stripe', 'paypal', 'crypto'].map((provider) => (
                <motion.div
                  key={provider}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-white"
                  onClick={() => handleConfigurePaymentMethod(provider)}
                >
                  {getPaymentMethodImage(provider) && (
                    <div className="h-24 flex items-center justify-center p-4 border-b">
                      <img 
                        src={getPaymentMethodImage(provider)} 
                        alt={provider} 
                        className="h-full object-contain" 
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getPaymentIcon(provider)}
                      <h3 className="font-semibold capitalize">{provider}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {provider === 'stripe' && 'Accept credit cards and more globally'}
                      {provider === 'paypal' && 'Popular online payment system'}
                      {provider === 'crypto' && 'Accept cryptocurrency payments'}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfigurePaymentMethod(provider);
                      }}
                    >
                      Configure
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {hasPaymentMethod || (paymentMethods && paymentMethods.some(pm => pm.is_active)) ? (
            <Button 
              onClick={goToNextStep}
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={() => handleConfigurePaymentMethod('stripe')}
              size="lg"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              Configure Payment Methods <CreditCard className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getPaymentIcon(selectedProvider)}
              Configure {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
            </DialogTitle>
          </DialogHeader>
          
          <PaymentMethodConfig 
            provider={selectedProvider}
            onSuccess={() => setIsConfigDialogOpen(false)}
            imageSrc={getPaymentMethodImage(selectedProvider)}
          />
        </DialogContent>
      </Dialog>
    </OnboardingLayout>
  );
};
