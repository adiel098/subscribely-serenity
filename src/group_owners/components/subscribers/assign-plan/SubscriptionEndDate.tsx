
import { CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Plan } from "../AssignPlanDialog";

interface SubscriptionEndDateProps {
  endDate: Date;
  selectedPlan: Plan | undefined;
}

export const SubscriptionEndDate = ({ endDate, selectedPlan }: SubscriptionEndDateProps) => {
  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-lg",
      selectedPlan ? "bg-green-50" : "bg-gray-50"
    )}>
      <CalendarClock className={cn(
        "h-5 w-5",
        selectedPlan ? "text-green-600" : "text-gray-400"
      )} />
      <div className="text-sm">
        <span className="font-medium">Subscription will end on: </span>
        <span className={selectedPlan ? "text-green-700" : "text-gray-500"}>
          {format(endDate, "MMMM d, yyyy")}
        </span>
      </div>
    </div>
  );
};
