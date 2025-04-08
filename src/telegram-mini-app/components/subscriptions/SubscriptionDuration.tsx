
import React from "react";
import { Clock } from "lucide-react";
import { Subscription } from "../../services/memberService";
import { getDetailedTimeRemaining } from "@/utils/dateUtils";

interface SubscriptionDurationProps {
  selectedPlan: any;
  activeSubscription: Subscription | null;
}

export const SubscriptionDuration: React.FC<SubscriptionDurationProps> = ({
  selectedPlan,
  activeSubscription
}) => {
  if (!activeSubscription) return null;
  
  const timeRemaining = getDetailedTimeRemaining(
    activeSubscription.subscription_end_date || activeSubscription.expiry_date
  );
  
  return (
    <div className="mt-3 p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 text-sm">
      <div className="flex items-center text-indigo-700">
        <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
        <span className="font-medium">Active Subscription Time Remaining:</span>
      </div>
      <div className="ml-5.5 mt-1 text-indigo-600">
        {timeRemaining}
      </div>
    </div>
  );
};
