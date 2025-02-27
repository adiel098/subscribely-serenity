
import React from "react";
import { Calendar, Clock } from "lucide-react";

interface SubscriptionDatesProps {
  startDate: string | null;
  endDate: string | null;
  createdAt?: string | null;
  expiryDate?: string | null;
}

export const SubscriptionDates: React.FC<SubscriptionDatesProps> = ({
  startDate,
  endDate,
  createdAt,
  expiryDate,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const effectiveStartDate = startDate || createdAt;
  const effectiveEndDate = endDate || expiryDate;

  return (
    <div className="flex justify-between text-muted-foreground mb-1">
      <div className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        <span>Started: {formatDate(effectiveStartDate)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" />
        <span>Ends: {formatDate(effectiveEndDate)}</span>
      </div>
    </div>
  );
};
