
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Loader2, 
  Download, 
  UserCheck, 
  UserX, 
  ChevronDown, 
  Users 
} from "lucide-react";

interface SubscribersHeaderProps {
  onUpdateStatus: (status: string) => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({ onUpdateStatus, onExport, isUpdating }: SubscribersHeaderProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-gray-800">
            <Users className="h-5 w-5 text-indigo-600" />
            Subscribers
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage subscribers and track membership status
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
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={() => onUpdateStatus("active")}
                className="cursor-pointer"
              >
                <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                Set All Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onUpdateStatus("inactive")}
                className="cursor-pointer"
              >
                <UserX className="mr-2 h-4 w-4 text-red-500" />
                Set All Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={onExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          
          {isUpdating && (
            <div className="animate-pulse p-2 rounded-full bg-indigo-100">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
