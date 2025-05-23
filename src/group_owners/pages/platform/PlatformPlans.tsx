
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { supabase } from "@/integrations/supabase/client";
import { useActivePaymentMethods } from "../../hooks/useActivePaymentMethods";
import { processPayment } from "../../services/platformPaymentService";
import { PlatformPlansHeader } from "../../components/platform-plans/PlatformPlansHeader";
import { CurrentSubscriptionAlert } from "../../components/platform-plans/CurrentSubscriptionAlert";
import { PlansLoadingSkeleton } from "../../components/platform-plans/PlansLoadingSkeleton";
import { PlatformPlansList } from "../../components/platform-plans/PlatformPlansList";
import { PaymentMethodsSection } from "../../components/platform-plans/PaymentMethodsSection";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PlatformPlans() {
  const { plans, isLoading } = usePlatformPlans();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = useActivePaymentMethods();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user?.id) return;
        
        const { data, error } = await supabase
          .from('platform_subscriptions')
          .select('*, platform_plans(*)')
          .eq('owner_id', session.session.user.id)
          .eq('is_active', true)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching subscription:', error);
          return;
        }
        
        setCurrentSubscription(data);
      } catch (err) {
        console.error('Error:', err);
      }
    };
    
    fetchCurrentSubscription();
  }, []);

  const handleSelectPlan = (plan: PlatformPlan) => {
    // Toggle off if already selected
    if (selectedPlan?.id === plan.id) {
      setSelectedPlan(null);
      setSelectedPaymentMethod(null);
    } else {
      setSelectedPlan(plan);
      setSelectedPaymentMethod(null);
    }
  };

  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentProcess = async () => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    if (!selectedPaymentMethod) {
      toast({
        title: "No payment method selected",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      await processPayment(selectedPlan, selectedPaymentMethod);

      toast({
        title: "Subscription Activated",
        description: `Your ${selectedPlan.name} subscription has been activated successfully!`,
      });

      // Refresh current subscription
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user?.id) {
        const { data } = await supabase
          .from('platform_subscriptions')
          .select('*, platform_plans(*)')
          .eq('owner_id', session.session.user.id)
          .eq('is_active', true)
          .maybeSingle();
          
        setCurrentSubscription(data);
      }
      
      // Reset selected plan and payment method
      setSelectedPlan(null);
      setSelectedPaymentMethod(null);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatInterval = (interval: string) => {
    switch (interval) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'yearly': return 'year';
      case 'lifetime': return 'one-time payment';
      default: return interval;
    }
  };
  
  return (
    <div className="w-full px-6 py-4">
      <div className="space-y-6 max-w-5xl mx-auto">
        <motion.div className="flex items-center space-x-3" initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
          <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
            <Sparkles className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Platform Plans <Sparkles className="h-5 w-5 inline text-amber-400" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Subscribe to a platform plan to enable premium features
            </p>
          </div>
        </motion.div>
        
        <CurrentSubscriptionAlert currentSubscription={currentSubscription} />
        
        {isLoading ? (
          <PlansLoadingSkeleton />
        ) : (
          <div className="space-y-8">
            <PlatformPlansList
              plans={plans}
              selectedPlan={selectedPlan}
              currentSubscription={currentSubscription}
              formatInterval={formatInterval}
              handleSelectPlan={handleSelectPlan}
            />
            
            {selectedPlan && (
              <PaymentMethodsSection
                selectedPlan={selectedPlan}
                paymentMethods={paymentMethods}
                paymentMethodsLoading={paymentMethodsLoading}
                selectedPaymentMethod={selectedPaymentMethod}
                isProcessing={isProcessing}
                handleSelectPaymentMethod={handleSelectPaymentMethod}
                handlePaymentProcess={handlePaymentProcess}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
