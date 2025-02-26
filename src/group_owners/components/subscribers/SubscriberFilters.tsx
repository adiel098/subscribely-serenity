
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckSquare, Filter, Search, XSquare } from "lucide-react";

interface SubscriberFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  planFilter: string | null;
  onPlanFilterChange: (value: string | null) => void;
  uniquePlans: any[];
}

export const SubscriberFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  planFilter,
  onPlanFilterChange,
  uniquePlans,
}: SubscriberFiltersProps) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by username or Telegram ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Status</span>
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="ml-2">
                {statusFilter}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onStatusFilterChange("all")}>
              <span className="mr-2">All</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("active")}>
              <CheckSquare className="mr-2 h-4 w-4 text-green-500" />
              <span>Active</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange("inactive")}>
              <XSquare className="mr-2 h-4 w-4 text-red-500" />
              <span>Inactive</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Plan</span>
            {planFilter && (
              <Badge variant="secondary" className="ml-2">
                {uniquePlans.find((p) => p.id === planFilter)?.name}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => onPlanFilterChange(null)}>
              <span className="mr-2">All Plans</span>
            </DropdownMenuItem>
            {uniquePlans.map((plan) => (
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
    </div>
  );
};
