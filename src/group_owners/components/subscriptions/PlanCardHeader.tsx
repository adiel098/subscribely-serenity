
import { StarIcon, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PlanCardHeaderProps {
  name: string;
  price: number;
  interval: string;
  intervalLabel: string;
}

export const PlanCardHeader = ({
  name,
  price,
  interval,
  intervalLabel
}: PlanCardHeaderProps) => {
  // Helper function to get emoji based on interval
  const getIntervalEmoji = (interval: string) => {
    switch (interval) {
      case 'monthly':
        return '📅';
      case 'quarterly':
        return '🗓️';
      case 'yearly':
        return '📆';
      case 'one-time':
        return '♾️';
      default:
        return '⏱️';
    }
  };
  
  return <div className="space-y-2">
      <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
        {name}
        <StarIcon className="h-4 w-4 text-amber-500" />
      </h3>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
          {formatCurrency(price)}
        </span>
        <span className="text-gray-600 text-sm">
          {interval === "one-time" ? "" : `/ ${intervalLabel}`}
        </span>
      </div>
      {interval !== "one-time" && (
        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
          <Clock className="h-3.5 w-3.5 text-indigo-500" />
          <span>{getIntervalEmoji(interval)} {intervalLabel} plan</span>
        </div>
      )}
    </div>;
};
