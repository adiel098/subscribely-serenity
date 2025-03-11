
import { Loader2 } from "lucide-react";
import { PlatformPlanCard, PlatformPlan } from "./PlatformPlanCard";

interface PlatformPlansGridProps {
  plans: PlatformPlan[];
  isLoading: boolean;
  selectedPlan: PlatformPlan | null;
  onSelectPlan: (plan: PlatformPlan) => void;
  formatInterval: (interval: string) => string;
}

export const PlatformPlansGrid = ({
  plans,
  isLoading,
  selectedPlan,
  onSelectPlan,
  formatInterval
}: PlatformPlansGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mb-6">
        {plans.filter(plan => plan.is_active).map((plan) => (
          <PlatformPlanCard
            key={plan.id}
            plan={plan}
            selectedPlanId={selectedPlan?.id || null}
            onSelectPlan={onSelectPlan}
            formatInterval={formatInterval}
          />
        ))}
      </div>
    </div>
  );
};
