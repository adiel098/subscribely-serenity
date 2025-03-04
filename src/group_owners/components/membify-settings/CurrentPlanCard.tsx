
import React from "react";
import { format } from "date-fns";
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
import { CalendarClock, CheckCircle, Crown, ArrowUpRight, Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
          .maybeSingle();

        if (subscriptionError) throw subscriptionError;
        setSubscription(subscriptionData);
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
  }, [user, toast]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const goToPlans = () => {
    navigate('/platform-plans');
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

  return (
    <div className="space-y-6">
      {subscription && (
        <div className="flex items-center bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-3" />
          <p className="text-green-700 font-medium">
            You are currently subscribed to the <span className="font-bold">{subscription.plan?.name}</span> plan. 
            Your subscription is active until {formatDate(subscription.subscription_end_date)}.
          </p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPlans.map((plan) => {
          const isCurrentPlan = subscription?.plan?.id === plan.id;
          
          return (
            <Card 
              key={plan.id} 
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
                    onClick={goToPlans} 
                    variant="outline" 
                    className="w-full border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" /> 
                    Switch to this Plan
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
