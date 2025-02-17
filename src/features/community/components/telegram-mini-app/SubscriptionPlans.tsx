
import { useState } from "react";
import { CheckCircle, CreditCard } from "lucide-react";
import { Badge } from "@/features/telegram mini app/components/ui/badge";
import { Card } from "@/features/telegram mini app/components/ui/card";
import { Plan } from "@/features/telegram mini app/pages/TelegramMiniApp";

interface SubscriptionPlansProps {
  plans: Plan[];
  selectedPlan: Plan | null;
  onPlanSelect: (plan: Plan) => void;
}

export const SubscriptionPlans = ({
  plans,
  selectedPlan,
  onPlanSelect,
}: SubscriptionPlansProps) => {
  const [selectedInterval, setSelectedInterval] = useState<string>("monthly");

  const filteredPlans = plans.filter(
    (plan) => plan.interval === selectedInterval
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground">
          Select the subscription plan that best fits your needs
        </p>
      </div>

      <div className="grid gap-4">
        {filteredPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 cursor-pointer transition-all ${
              selectedPlan?.id === plan.id
                ? "border-primary ring-2 ring-primary ring-offset-2"
                : "hover:border-primary/50"
            }`}
            onClick={() => onPlanSelect(plan)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="font-medium">{plan.name}</h3>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                )}

                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlan?.id === plan.id && (
                <Badge variant="secondary" className="shrink-0">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Selected
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
