
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Download, UserCheck, UserX, ChevronDown } from "lucide-react";

interface SubscribersHeaderProps {
  onUpdateStatus: (status: string) => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({ onUpdateStatus, onExport, isUpdating }: SubscribersHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscribers</h2>
        <p className="text-muted-foreground">
          View and manage your community subscribers
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <ChevronDown className="h-4 w-4" />
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onUpdateStatus("active")}>
              <UserCheck className="mr-2 h-4 w-4" />
              Set All Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus("inactive")}>
              <UserX className="mr-2 h-4 w-4" />
              Set All Inactive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
    </div>
  );
};
