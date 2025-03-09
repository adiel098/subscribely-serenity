
import React from "react";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { CalendarClock } from "lucide-react";
import { motion } from "framer-motion";

interface SubscriptionDurationProps {
  selectedPlan: Plan;
}

export const SubscriptionDuration: React.FC<SubscriptionDurationProps> = ({ selectedPlan }) => {
  const getEndDate = (plan: Plan) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    
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
        return "לצמיתות";
      default:
        endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
    }
    
    return endDate.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getDurationText = (plan: Plan) => {
    switch (plan.interval) {
      case "monthly":
        return "חודש אחד";
      case "quarterly":
        return "שלושה חודשים";
      case "half-yearly":
        return "שישה חודשים";
      case "yearly":
        return "שנה אחת";
      case "lifetime":
        return "לצמיתות";
      default:
        return "חודש אחד";
    }
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
            <h3 className="font-medium text-sm">פרטי המנוי</h3>
            <p className="text-xs text-gray-600">
              המנוי יהיה תקף למשך {getDurationText(selectedPlan)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">תאריך סיום:</p>
          <p className="text-sm font-semibold text-primary">{getEndDate(selectedPlan)}</p>
        </div>
      </div>
    </motion.div>
  );
};
