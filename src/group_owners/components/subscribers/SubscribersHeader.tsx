
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
  Users, 
  SparklesIcon 
} from "lucide-react";

interface SubscribersHeaderProps {
  onUpdateStatus: (status: string) => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({ onUpdateStatus, onExport, isUpdating }: SubscribersHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-6 border border-indigo-100 shadow-sm">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.8))] -z-10" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            <Users className="h-6 w-6 text-indigo-600" />
            Community Subscribers
            <SparklesIcon className="h-5 w-5 text-amber-500" />
          </h2>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Manage your members, track subscriptions, and grow your community ✨
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 border-indigo-200 bg-white shadow-sm hover:bg-indigo-50">
                <ChevronDown className="h-4 w-4 text-indigo-600" />
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-indigo-100">
              <DropdownMenuItem 
                onClick={() => onUpdateStatus("active")}
                className="cursor-pointer hover:bg-green-50"
              >
                <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                Set All Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onUpdateStatus("inactive")}
                className="cursor-pointer hover:bg-red-50"
              >
                <UserX className="mr-2 h-4 w-4 text-red-500" />
                Set All Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            onClick={onExport}
            className="border-indigo-200 bg-white shadow-sm hover:bg-indigo-50"
          >
            <Download className="mr-2 h-4 w-4 text-indigo-600" />
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
