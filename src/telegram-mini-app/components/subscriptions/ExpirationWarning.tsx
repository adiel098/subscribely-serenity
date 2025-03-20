
import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ExpirationWarningProps {
  daysLeft: number;
}

export const ExpirationWarning: React.FC<ExpirationWarningProps> = ({ daysLeft }) => {
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
  
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`mt-3 rounded-md border px-3 py-2 text-sm flex items-center gap-2 ${urgencyStyles[urgency]}`}
    >
      <Clock className="h-4 w-4 flex-shrink-0" />
      <div>
        <span className="font-medium">{messages[urgency]}</span>
        <span className="ml-1">
          {daysLeft === 1 ? "Tomorrow" : `${daysLeft} days left`}
        </span>
      </div>
    </motion.div>
  );
};
