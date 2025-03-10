
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-1 mt-1">
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
        {name}
        <StarIcon className="h-4 w-4 text-amber-500" />
      </h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
          {formatCurrency(price)}
        </span>
        <span className="text-gray-600 text-sm">
          {interval === "one-time" ? "" : `/ ${intervalLabel}`}
        </span>
      </div>
    </div>
  );
};
