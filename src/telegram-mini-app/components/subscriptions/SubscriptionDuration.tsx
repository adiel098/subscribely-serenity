
import React from "react";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { Calendar, Sparkle } from "lucide-react";
import { motion } from "framer-motion";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { getDaysRemaining } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SubscriptionDurationProps {
  selectedPlan: SubscriptionPlan;
  activeSubscription?: Subscription | null;
}

export const SubscriptionDuration: React.FC<SubscriptionDurationProps> = ({ 
  selectedPlan,
  activeSubscription
}) => {
  // Calculate how many days would be added from existing subscription
  const remainingDays = activeSubscription ? getDaysRemaining(activeSubscription) : 0;
  
  const getEndDate = (plan: SubscriptionPlan) => {
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
      case "one-time":
        return "Lifetime"; // Treat one-time as lifetime for end date display
      default:
        endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
    }
    
    // Format date as MM/DD/YYYY
    return `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}`;
  };

  const getDurationText = (plan: SubscriptionPlan) => {
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
      case "one-time":
        return "lifetime"; // Treat one-time as lifetime for duration text
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-3"
    >
      <div className="border border-indigo-100 bg-white/90 shadow-sm overflow-hidden rounded-lg">
        <div className="p-3 relative">
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-indigo-600 bg-indigo-100 p-1.5 rounded-full">
                <Calendar className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold text-indigo-700 flex items-center text-sm">
                  Subscription Details <Sparkle className="h-3 w-3 ml-1 text-indigo-500" />
                </h3>
              </div>
            </div>
            
            {/* End date with special background */}
            <div className="text-right bg-indigo-500 text-white px-2 py-1 rounded-lg shadow-sm">
              <p className="text-xs font-medium text-indigo-100">End Date:</p>
              <p className="text-xs font-bold">{getEndDate(selectedPlan)}</p>
            </div>
          </div>
          
          {/* Subscription details */}
          <p className="text-xs text-indigo-700 mt-1">
            Your subscription will be valid for <span className="font-medium">{getDurationText(selectedPlan)}</span>
          </p>
          
          {/* Remaining days badge */}
          {remainingDays > 0 && (
            <div className="mt-2">
              <Badge variant="outline" className="bg-indigo-100/80 text-indigo-700 border-indigo-200 py-0.5 px-1.5 text-xs">
                +{remainingDays} days
              </Badge>
              <span className="ml-1 text-xs text-indigo-600">
                from your current subscription will be added
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
