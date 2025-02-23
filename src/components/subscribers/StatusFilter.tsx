
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
import { CheckSquare, XSquare } from "lucide-react";

interface StatusFilterProps {
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (status: "all" | "active" | "inactive") => void;
}

export const StatusFilter = ({ statusFilter, onStatusFilterChange }: StatusFilterProps) => {
  return (
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
  );
};
