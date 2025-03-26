import { format } from "date-fns";
import { Plan } from "../AssignPlanDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriptionEndDateProps {
  endDate: Date;
  selectedPlan: Plan | undefined;
}

export const SubscriptionEndDate = ({ endDate, selectedPlan }: SubscriptionEndDateProps) => {
  const isMobile = useIsMobile();
  
  if (!selectedPlan) return null;

  return (
    <div className={`rounded-lg border p-3 ${isMobile ? 'p-2 text-xs' : ''}`}>
      <p className={`font-medium ${isMobile ? 'text-sm mb-1' : 'mb-2'}`}>Subscription Summary</p>
      <div className="space-y-1">
        <p>Plan: {selectedPlan.name}</p>
        <p>End Date: {format(endDate, 'MMM d, yyyy')}</p>
        <p>Price: ${selectedPlan.price}</p>
      </div>
    </div>
  );
};
