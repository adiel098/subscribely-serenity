
import { StarIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PlanCardHeaderProps {
  name: string;
  price: number;
  interval: string;
  intervalLabel: string;
}

export const PlanCardHeader = ({ name, price, interval, intervalLabel }: PlanCardHeaderProps) => {
  return (
    <div className="space-y-1">
      <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
        {name}
        <StarIcon className="h-3.5 w-3.5 text-amber-500" />
      </h3>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
          {formatCurrency(price)}
        </span>
        <span className="text-gray-600 text-xs">
          {interval === "one-time" ? "" : `/ ${intervalLabel}`}
        </span>
      </div>
    </div>
  );
};
