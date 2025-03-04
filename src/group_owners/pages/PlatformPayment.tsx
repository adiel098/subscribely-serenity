import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Wallet, Bitcoin, ArrowRight, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useActivePaymentMethods } from "../hooks/useActivePaymentMethods";

interface PlatformPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

export default function PlatformPaymentMethods() {
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: activePlatformPaymentMethods, isLoading } = useActivePaymentMethods();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the selected plan from localStorage
    const planData = localStorage.getItem('selectedPlatformPlan');
    if (planData) {
      try {
        setSelectedPlan(JSON.parse(planData));
      } catch (e) {
        console.error('Error parsing plan data:', e);
      }
    }
  }, []);

  const handlePaymentProcess = async (paymentMethod: string) => {
    if (!selectedPlan) {
      toast({
        title: "No plan selected",
        description: "Please go back and select a subscription plan",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to proceed with payment",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Calculate subscription end date based on interval
      const calculateEndDate = (interval: string) => {
        const now = new Date();
        switch (interval) {
          case 'monthly':
            return new Date(now.setMonth(now.getMonth() + 1));
          case 'quarterly':
            return new Date(now.setMonth(now.getMonth() + 3));
          case 'yearly':
            return new Date(now.setFullYear(now.getFullYear() + 1));
          case 'lifetime':
            return new Date(now.setFullYear(now.getFullYear() + 99)); // Effectively lifetime
          default:
            return new Date(now.setMonth(now.getMonth() + 1));
        }
      };

      const endDate = calculateEndDate(selectedPlan.interval);

      // Create subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('platform_subscriptions')
        .insert({
          owner_id: session.session.user.id,
          plan_id: selectedPlan.id,
          subscription_start_date: new Date(),
          subscription_end_date: endDate,
          auto_renew: true,
          is_active: true,
          status: 'active'
        })
        .select()
        .single();

      if (subscriptionError) {
        throw subscriptionError;
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('platform_payments')
        .insert({
          owner_id: session.session.user.id,
          plan_id: selectedPlan.id,
          subscription_id: subscription.id,
          amount: selectedPlan.price,
          payment_method: paymentMethod,
          payment_status: 'completed',
          transaction_id: `${paymentMethod}-${Date.now()}`
        });

      if (paymentError) {
        throw paymentError;
      }

      // Clear the selected plan from localStorage
      localStorage.removeItem('selectedPlatformPlan');

      toast({
        title: "Subscription Activated",
        description: `Your ${selectedPlan.name} subscription has been activated successfully!`,
      });

      // Redirect back to dashboard
      navigate('/dashboard');
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'stripe':
        return <CreditCard className="h-6 w-6" />;
      case 'paypal':
        return <Wallet className="h-6 w-6" />;
      case 'crypto':
        return <Bitcoin className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  if (!selectedPlan) {
    return (
      <div className="container max-w-6xl px-4 py-10">
        <Alert variant="destructive">
          <AlertTitle>No Plan Selected</AlertTitle>
          <AlertDescription>
            Please go back and select a subscription plan first.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/platform-plans')}
          className="mt-4"
        >
          Back to Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Select Payment Method</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose how you'd like to pay for your "{selectedPlan.name}" subscription
        </p>
      </div>

      <Card className="mb-8 border-indigo-100">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{selectedPlan.name} Plan</p>
              <p className="text-sm text-muted-foreground">
                {selectedPlan.interval.charAt(0).toUpperCase() + selectedPlan.interval.slice(1)} billing
              </p>
            </div>
            <div className="text-xl font-bold">${selectedPlan.price}</div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Available Payment Methods</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {activePlatformPaymentMethods && activePlatformPaymentMethods.length > 0 ? (
            activePlatformPaymentMethods.map((method) => (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full cursor-pointer hover:border-indigo-300 transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getPaymentMethodIcon(method.provider)}
                      <span className="capitalize">{method.provider}</span>
                    </CardTitle>
                    <CardDescription>
                      Pay with {method.provider}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button
                      className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handlePaymentProcess(method.provider)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay ${selectedPlan.price}
                          <ArrowRight className="h-4 w-4 ml-auto" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 p-6 text-center border rounded-lg bg-gray-50">
              <p className="text-muted-foreground">No payment methods are currently available. Please try again later.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/platform-plans')}
        >
          Back to Plans
        </Button>
      </div>
    </div>
  );
}
