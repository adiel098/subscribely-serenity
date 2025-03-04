
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Package,
  CreditCard,
  Clock,
  Users,
  Building,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivePaymentMethods } from "../hooks/useActivePaymentMethods";
import { processPayment } from "../services/platformPaymentService";
import { PaymentMethodsGrid } from "../components/platform-payment/PaymentMethodsGrid";

export default function PlatformPlans() {
  const { plans, isLoading } = usePlatformPlans();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    } else {
      setSelectedPlan(plan);
    }
  };

  const handlePaymentProcess = async (paymentMethod: string) => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      await processPayment(selectedPlan, paymentMethod);

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
      
      // Reset selected plan
      setSelectedPlan(null);
      
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
    <div className="container max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Platform Subscription Plans</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose the right plan to manage your Telegram communities efficiently and maximize your revenue
        </p>
      </div>
      
      {currentSubscription && (
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Package className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 font-medium">Active Subscription</AlertTitle>
          <AlertDescription className="text-blue-700">
            You're currently subscribed to the <span className="font-semibold">{currentSubscription.platform_plans?.name}</span> plan. 
            {currentSubscription.subscription_end_date && (
              <span> Your subscription is valid until {new Date(currentSubscription.subscription_end_date).toLocaleDateString()}.</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-2 border-muted">
              <CardHeader>
                <Skeleton className="h-7 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(j => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.filter(plan => plan.is_active).map((plan) => (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className={`h-full flex flex-col border-2 cursor-pointer ${
                    selectedPlan?.id === plan.id 
                      ? 'border-indigo-400 shadow-md ring-2 ring-indigo-200'
                      : plan.name.toLowerCase().includes('pro') 
                        ? 'border-indigo-200 shadow-sm' 
                        : 'border-muted'
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <CardHeader>
                    {plan.name.toLowerCase().includes('pro') && (
                      <Badge className="self-start mb-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
                        Most Popular
                      </Badge>
                    )}
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex items-baseline mb-4">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        /{formatInterval(plan.interval)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm">Up to {plan.max_communities} communities</span>
                      </div>
                      
                      {plan.max_members_per_community && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm">Up to {plan.max_members_per_community} members per community</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm capitalize">{plan.interval} billing</span>
                      </div>
                      
                      {plan.features && plan.features.length > 0 && (
                        <div className="pt-4">
                          <h4 className="font-medium text-sm mb-2">Features included:</h4>
                          <ul className="space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {selectedPlan?.id === plan.id ? (
                      <Badge className="w-full py-2 justify-center bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-none">
                        Selected
                      </Badge>
                    ) : currentSubscription && currentSubscription.platform_plans?.id === plan.id ? (
                      <Badge className="w-full py-2 justify-center bg-green-100 text-green-800 hover:bg-green-200 border-none">
                        Current Plan
                      </Badge>
                    ) : (
                      <Badge className="w-full py-2 justify-center bg-gray-100 text-gray-800 hover:bg-gray-200 border-none">
                        Click to Select
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-indigo-100 rounded-lg p-6 shadow-sm overflow-hidden"
            >
              <h2 className="text-xl font-semibold mb-6 text-center">
                <CreditCard className="inline-block mr-2 h-5 w-5 text-indigo-500" />
                Payment Method for {selectedPlan.name} Plan
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div>
                    <p className="font-medium text-indigo-900">{selectedPlan.name} Plan</p>
                    <p className="text-sm text-indigo-700">
                      {selectedPlan.interval.charAt(0).toUpperCase() + selectedPlan.interval.slice(1)} billing
                    </p>
                  </div>
                  <div className="text-xl font-bold text-indigo-900">${selectedPlan.price}</div>
                </div>
              </div>
              
              <PaymentMethodsGrid
                paymentMethods={paymentMethods}
                isLoading={paymentMethodsLoading}
                selectedPlanPrice={selectedPlan.price}
                isProcessing={isProcessing}
                onSelectPaymentMethod={handlePaymentProcess}
              />
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
