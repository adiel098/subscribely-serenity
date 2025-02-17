
import { Card } from "@/components/ui/card";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { TelegramWebAppContext } from "@/features/community/pages/TelegramMiniApp";
import { useContext } from "react";

interface SubscriptionPlansProps {
  plans: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    interval: string;
  }>;
  selectedPlan?: any;
  onPlanSelect?: (plan: any) => void;
}

export const SubscriptionPlans = ({ plans, selectedPlan, onPlanSelect }: SubscriptionPlansProps) => {
  const webApp = useContext(TelegramWebAppContext);

  if (!plans) {
    return <div>Loading plans...</div>;
  }

  return (
    <div className="grid gap-4">
      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className="p-4 cursor-pointer hover:border-primary/50 transition-all"
          onClick={() => onPlanSelect?.(plan)}
        >
          <h3 className="font-semibold">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
          <p className="mt-2 font-bold">${plan.price}/month</p>
        </Card>
      ))}
    </div>
  );
};
