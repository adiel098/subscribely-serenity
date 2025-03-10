
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { Calendar, Sparkle } from "lucide-react";
import { motion } from "framer-motion";
import { Subscription } from "@/telegram-mini-app/services/memberService";
import { getDaysRemaining } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-4"
    >
      <Card className="border border-indigo-200 bg-indigo-50/50 shadow-sm overflow-hidden">
        <div className="p-4 relative">
          {/* Header with background color and icon */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-indigo-600 bg-indigo-100 p-2 rounded-full">
                <Calendar className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-indigo-700 flex items-center">
                  Subscription Details <Sparkle className="h-3.5 w-3.5 ml-1 text-indigo-500" />
                </h3>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-indigo-600 font-medium">End Date:</p>
              <p className="text-sm font-bold text-indigo-700">{getEndDate(selectedPlan)}</p>
            </div>
          </div>
          
          {/* Subscription details */}
          <p className="text-sm text-indigo-700 mt-1">
            Your subscription will be valid for <span className="font-medium">{getDurationText(selectedPlan)}</span>
          </p>
          
          {/* Remaining days badge */}
          {remainingDays > 0 && (
            <div className="mt-3">
              <Badge variant="outline" className="bg-indigo-100/80 text-indigo-700 border-indigo-200 py-1 px-2">
                +{remainingDays} days
              </Badge>
              <span className="ml-2 text-xs text-indigo-600">
                from your current subscription will be added
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
