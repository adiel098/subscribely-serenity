
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar, Check, CreditCard } from 'lucide-react';
import { SubscriptionPlan } from '@/types';

interface SubscriptionPlansListProps {
  plans: SubscriptionPlan[];
  communityId: string;
  telegramUserId: string | null;
}

export const SubscriptionPlansList: React.FC<SubscriptionPlansListProps> = ({ 
  plans, 
  communityId,
  telegramUserId 
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId) return;
    if (!telegramUserId) {
      toast.error("User authentication required");
      return;
    }

    setIsLoading(true);
    try {
      // This is a placeholder - actual payment processing will be implemented later
      toast.success("Subscription request initiated!");
      setTimeout(() => {
        toast.info("This is a demo. Actual payment processing will be implemented in the future.");
      }, 1500);
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription");
    } finally {
      setIsLoading(false);
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-muted-foreground">No subscription plans available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Available Plans</h2>
      <div className="grid gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlanId === plan.id 
                ? 'border-primary bg-primary/5 shadow-sm' 
                : 'hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
                
                <div className="flex items-center text-sm mt-2">
                  <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <span>
                    {plan.duration_type === 'days' 
                      ? `${plan.duration} days` 
                      : plan.duration_type === 'months'
                        ? `${plan.duration} months`
                        : `${plan.duration} years`
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold">${plan.price}</span>
                {selectedPlanId === plan.id && (
                  <span className="text-primary mt-1">
                    <Check className="h-5 w-5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        className="w-full mt-6"
        disabled={!selectedPlanId || isLoading}
        onClick={handleSubscribe}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        {isLoading ? "Processing..." : "Subscribe Now"}
      </Button>
    </div>
  );
};
