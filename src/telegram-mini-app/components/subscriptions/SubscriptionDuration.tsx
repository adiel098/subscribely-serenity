
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { getDaysRemaining } from "./utils";

interface SubscriptionDurationProps {
  selectedPlan: Plan;
  activeSubscription?: Subscription | null;
}

export const SubscriptionDuration: React.FC<SubscriptionDurationProps> = ({ 
  selectedPlan,
  activeSubscription
}) => {
  // Calculate how many days would be added from existing subscription
  const remainingDays = activeSubscription ? getDaysRemaining(activeSubscription) : 0;
  
  const getEndDate = (plan: Plan) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    // Add the remaining days from existing subscription
    if (remainingDays > 0) {
      endDate.setDate(endDate.getDate() + remainingDays);
    }
    
    // Then add the time from the new plan
    switch (plan.interval) {
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "half-yearly":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case "lifetime":
        return "Lifetime";
      default:
        endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
    }
    
    // Format date as MM/DD/YYYY
    return `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;
  };

  const getDurationText = (plan: Plan) => {
    let baseDuration = "";
    
    switch (plan.interval) {
      case "monthly":
        baseDuration = "one month";
        break;
      case "quarterly":
        baseDuration = "three months";
        break;
      case "half-yearly":
        baseDuration = "six months";
        break;
      case "yearly":
        baseDuration = "one year";
        break;
      case "lifetime":
        return "lifetime";
      default:
        baseDuration = "one month";
    }
    
    // If there are remaining days, mention them
    if (remainingDays > 0) {
      return `${baseDuration} + ${remainingDays} remaining days from your current subscription`;
    }
    
    return baseDuration;
  };

  return (
    <motion.div
      className="mt-4 mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <CalendarClock className="h-5 w-5" />
          <div>
            <h3 className="font-medium text-sm">Subscription Details</h3>
            <p className="text-xs text-gray-600">
              Your subscription will be valid for {getDurationText(selectedPlan)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">End Date:</p>
          <p className="text-sm font-semibold text-primary">{getEndDate(selectedPlan)}</p>
        </div>
      </div>
      
      {remainingDays > 0 && (
        <div className="mt-2 pt-2 border-t border-primary/10 text-xs text-gray-600">
          <p>Your current subscription has {remainingDays} days remaining that will be added to your new subscription period.</p>
        </div>
      )}
    </motion.div>
  );
};
