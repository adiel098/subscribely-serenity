
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";

interface PlanCardHeaderProps {
  name: string;
  price: number;
  interval: string;
  intervalLabel: string;
}

export const PlanCardHeader = ({ name, price, interval, intervalLabel }: PlanCardHeaderProps) => {
  return (
    <div className="space-y-1 mt-2">
      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        {name}
        <StarIcon className="h-5 w-5 text-yellow-500" />
      </h3>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          ${price}
        </span>
        <span className="text-gray-600 text-lg">
          {interval === "one-time" ? "" : `/ ${intervalLabel}`}
        </span>
      </div>
    </div>
  );
};
