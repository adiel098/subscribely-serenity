
import React from "react";
import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";
import { Subscription } from "../../services/memberService";
import { Button } from "@/components/ui/button";
import { getDaysRemaining } from "./utils";

interface ExpirationWarningProps {
  daysLeft?: number;
  subscription?: Subscription;
  onRenew?: (subscription: Subscription) => void;
}

export const ExpirationWarning: React.FC<ExpirationWarningProps> = ({ 
  daysLeft: propDaysLeft, 
  subscription,
  onRenew
}) => {
  // If a subscription is provided, calculate days left from it
  const daysLeft = subscription 
    ? getDaysRemaining(subscription)
    : propDaysLeft || 0;
  
  // Determine urgency level based on days left
  const getUrgencyLevel = () => {
    if (daysLeft <= 2) return "high";
    if (daysLeft <= 5) return "medium";
    return "low";
  };
  
  const urgency = getUrgencyLevel();
  
  const urgencyStyles = {
    high: "border-red-200 bg-red-50 text-red-600",
    medium: "border-amber-200 bg-amber-50 text-amber-600",
    low: "border-blue-200 bg-blue-50 text-blue-600"
  };
  
  const messages = {
    high: "Expiring very soon!",
    medium: "Expiring soon",
    low: "Will expire soon"
  };

  const handleRenew = () => {
    if (onRenew && subscription) {
      onRenew(subscription);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`mt-3 rounded-md border px-3 py-2 text-sm flex items-center justify-between ${urgencyStyles[urgency]}`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <div>
          <span className="font-medium">{messages[urgency]}</span>
          <span className="ml-1">
            {daysLeft === 1 ? "Tomorrow" : `${daysLeft} days left`}
          </span>
        </div>
      </div>
      
      {onRenew && subscription && (
        <Button 
          size="sm" 
          className="h-7 px-2 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-sm"
          onClick={handleRenew}
        >
          <Zap className="h-3 w-3 mr-1" />
          Renew
        </Button>
      )}
    </motion.div>
  );
};
