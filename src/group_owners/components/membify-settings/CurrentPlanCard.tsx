
import React, { useState } from "react";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  CalendarClock, 
  CheckCircle, 
  Crown, 
  ArrowUpRight, 
  Loader2, 
  Check, 
  CreditCard,
  Clock,
  Calendar,
  PlusCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useActivePaymentMethods } from "@/group_owners/hooks/useActivePaymentMethods";
import { PaymentMethodsGrid } from "@/group_owners/components/platform-payment/PaymentMethodsGrid";
import { processPayment } from "@/group_owners/services/platformPaymentService";
import { formatDate, calculateDaysRemaining } from "@/group_owners/utils/dateUtils";

interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string;
  features?: string[];
  is_active: boolean;
}

interface Subscription {
  id: string;
  status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  auto_renew: boolean;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    description: string;
    features?: string[];
  } | null;
}

export function CurrentPlanCard() {
  const [subscription, setSubscription] = React.useState<Subscription | null>(null);
  const [allPlans, setAllPlans] = React.useState<PlatformPlan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = useActivePaymentMethods();

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all active platform plans
        const { data: plansData, error: plansError } = await supabase
          .from('platform_plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
          
        if (plansError) throw plansError;
        setAllPlans(plansData || []);

        // Get the active subscription (if any)
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('platform_subscriptions')
          .select(`
            *,
            plan:platform_plans(
              id,
              name, 
              price, 
              interval, 
              description,
              features
            )
          `)
          .eq('owner_id', user.id)
          .eq('status', 'active')
          .order('subscription_start_date', { ascending: false })
          .maybeSingle(); // Using maybeSingle() instead of single() to handle cases where there might be no subscription

        if (subscriptionError && !subscriptionError.message.includes('JSON object requested, multiple (or no) rows returned')) {
          throw subscriptionError;
        }
        
        setSubscription(subscriptionData || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subscription details."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, toast, paymentSuccess]);

  const handleSwitchPlan = (plan: PlatformPlan) => {
    if (selectedPlan?.id === plan.id) {
      setSelectedPlan(null); // Toggle off if clicking the same plan
    } else {
      setSelectedPlan(plan);
      setSelectedPaymentMethod(null);
    }
  };

  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleProcessPayment = async () => {
    if (!selectedPlan || !selectedPaymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method to continue",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      await processPayment(selectedPlan, selectedPaymentMethod);
      
      toast({
        title: "Success",
        description: `Successfully subscribed to the ${selectedPlan.name} plan`,
      });
      
      setPaymentSuccess(true);
      setSelectedPlan(null);
      setSelectedPaymentMethod(null);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-indigo-100 shadow-sm">
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="ml-2">Loading subscription details...</span>
        </CardContent>
      </Card>
    );
  }

  if (allPlans.length === 0) {
    return (
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-500" />
            No Plans Available
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">
            There are currently no available subscription plans.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate days remaining for subscription
  const daysRemaining = subscription ? calculateDaysRemaining(subscription.subscription_end_date) : 0;

  return (
    <div className="space-y-6">
      {subscription && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{subscription.plan?.name} Plan</h3>
                <p className="text-sm text-gray-600">{subscription.plan?.description}</p>
              </div>
              <Badge className="self-start md:self-auto bg-green-500 text-white px-3 py-1">
                Active
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-green-100">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(subscription.subscription_start_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-green-100">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(subscription.subscription_end_date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-green-100">
                <Clock className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-500">Time Remaining</p>
                  <p className="font-medium">{daysRemaining} days left</p>
                </div>
              </div>
            </div>
            
            {subscription.plan?.features && Array.isArray(subscription.plan.features) && subscription.plan.features.length > 0 && (
              <div className="pt-2 border-t border-green-100">
                <h4 className="text-sm font-medium mb-2">Your Plan Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <h2 className="text-xl font-bold mt-8 mb-2 flex items-center gap-2">
        <Crown className="h-5 w-5 text-indigo-600" />
        Available Plans
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPlans.map((plan) => {
          const isCurrentPlan = subscription?.plan?.id === plan.id;
          
          return (
            <div key={plan.id} className="space-y-4">
              <Card 
                className={`border-2 transition-all ${
                  isCurrentPlan 
                    ? 'border-green-300 shadow-md' 
                    : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                }`}
              >
                <CardHeader className={isCurrentPlan ? 'bg-green-50' : ''}>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      {plan.name}
                    </CardTitle>
                    {isCurrentPlan && (
                      <Badge variant="success" className="px-2 py-1">
                        <Check className="h-3 w-3 mr-1" /> Current
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">${plan.price.toFixed(2)}</span>
                      <span className="text-gray-500 text-sm">/{plan.interval}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                    
                    {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2">Features:</h4>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50 rounded-b-lg">
                  {isCurrentPlan ? (
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      disabled
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> 
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleSwitchPlan(plan)} 
                      variant="outline" 
                      className={`w-full ${
                        selectedPlan?.id === plan.id 
                          ? 'border-indigo-400 bg-indigo-50 text-indigo-700' 
                          : 'border-indigo-200 hover:bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {subscription ? (
                        <>
                          <ArrowUpRight className="h-4 w-4 mr-2" /> 
                          Switch to this Plan
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-4 w-4 mr-2" /> 
                          Choose this Plan
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Payment methods section that appears when this plan is selected */}
              {selectedPlan?.id === plan.id && (
                <Card className="border-indigo-200 shadow-sm animate-in fade-in-50 slide-in-from-top-4 duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-indigo-600" />
                      Select Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <PaymentMethodsGrid
                      paymentMethods={paymentMethods || []}
                      isLoading={isLoadingPaymentMethods}
                      selectedPlanPrice={selectedPlan.price}
                      isProcessing={isProcessingPayment}
                      onSelectPaymentMethod={handleSelectPaymentMethod}
                      selectedPaymentMethod={selectedPaymentMethod}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-4">
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={!selectedPaymentMethod || isProcessingPayment}
                      onClick={handleProcessPayment}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Complete Payment
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
