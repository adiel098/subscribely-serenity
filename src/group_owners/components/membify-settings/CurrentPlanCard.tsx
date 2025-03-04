
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
import { CalendarClock, CheckCircle, Crown, ArrowUpRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [isLoading, setIsLoading] = React.useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) return;
      
      try {
        // Get the active subscription (if any)
        const { data, error } = await supabase
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

        if (error) throw error;
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subscription details."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
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

  if (!subscription) {
    return (
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-500" />
            No Active Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 mb-4">
            You don't have an active subscription plan.
            Get access to premium features by subscribing to one of our plans.
          </p>
          <Button 
            onClick={goToPlans} 
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Crown className="h-4 w-4 mr-2" /> 
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-indigo-600" />
          {subscription.plan?.name || 'Current Plan'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold">${subscription.plan?.price.toFixed(2) || '0.00'}</span>
            <span className="text-gray-500">/{subscription.plan?.interval}</span>
          </div>
          
          <p className="text-gray-600">{subscription.plan?.description}</p>
          
          <div className="space-y-2 pt-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarClock className="h-4 w-4 text-indigo-500" />
              <span>Start date: {formatDate(subscription.subscription_start_date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarClock className="h-4 w-4 text-indigo-500" />
              <span>Renewal date: {formatDate(subscription.subscription_end_date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Status: Active</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-indigo-500" />
              <span>Auto-renew: {subscription.auto_renew ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
          
          {subscription.plan?.features && Array.isArray(subscription.plan.features) && (
            <div className="pt-3">
              <h4 className="text-sm font-medium mb-2">Included Features:</h4>
              <ul className="space-y-1">
                {subscription.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 rounded-b-lg">
        <Button 
          onClick={goToPlans} 
          variant="outline" 
          className="w-full border-indigo-200 hover:bg-indigo-50 text-indigo-700"
        >
          <ArrowUpRight className="h-4 w-4 mr-2" /> 
          Upgrade Plan
        </Button>
      </CardFooter>
    </Card>
  );
}
