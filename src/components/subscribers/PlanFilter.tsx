
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plan } from "@/types/subscription";

interface PlanFilterProps {
  planFilter: string | null;
  uniquePlans: (Plan | null)[];
  onPlanFilterChange: (planId: string | null) => void;
}

export const PlanFilter = ({ planFilter, uniquePlans, onPlanFilterChange }: PlanFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Plan</span>
          {planFilter && (
            <Badge variant="secondary" className="ml-2">
              {uniquePlans.find((p) => p?.id === planFilter)?.name}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onPlanFilterChange(null)}>
            <span className="mr-2">All Plans</span>
          </DropdownMenuItem>
          {uniquePlans.map((plan) => plan && (
            <DropdownMenuItem
              key={plan.id}
              onClick={() => onPlanFilterChange(plan.id)}
            >
              <span>{plan.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
