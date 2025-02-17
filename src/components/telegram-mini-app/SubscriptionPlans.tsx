
import { Card } from "@/components/ui/card";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { TelegramWebAppContext } from "@/features/community/pages/TelegramMiniApp";
import { useContext } from "react";

export const SubscriptionPlans = () => {
  const webApp = useContext(TelegramWebAppContext);
  const { selectedCommunityId } = useCommunityContext();
  const { data: plans, isLoading } = useSubscriptionPlans(selectedCommunityId || "");

  if (isLoading) {
    return <div>Loading plans...</div>;
  }

  return (
    <div className="grid gap-4">
      {plans?.map((plan) => (
        <Card key={plan.id} className="p-4">
          <h3 className="font-semibold">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
          <p className="mt-2 font-bold">${plan.price}/month</p>
        </Card>
      ))}
    </div>
  );
};
