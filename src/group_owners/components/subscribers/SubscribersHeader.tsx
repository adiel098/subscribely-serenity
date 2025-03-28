
import { RefreshCw, FileSpreadsheet, Users, FilterIcon, UserPlus, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscribersHeaderProps {
  onUpdateStatus: () => void;
  onExport: () => void;
  isUpdating: boolean;
  onAddSubscriber?: () => void;
  onFilter?: () => void;
  hasFilters?: boolean;
}

export const SubscribersHeader = ({
  onUpdateStatus,
  onExport,
  isUpdating,
  onAddSubscriber,
  onFilter,
  hasFilters = false
}: SubscribersHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center gap-2">
        <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mr-2">
          <SquareCheck className="h-5 w-5 text-indigo-600" />
        </div>
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center`}>
          Subscribers <Sparkles className="h-5 w-5 ml-1 text-amber-400" />
        </h1>
        
        {isMobile && onFilter && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onFilter}
            className={`ml-auto px-2 h-8 ${hasFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : ''}`}
          >
            <FilterIcon className="h-3.5 w-3.5" />
          </Button>
        )}
        
        {isMobile && onAddSubscriber && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddSubscriber}
            className="px-2 h-8 border-green-200 text-green-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Manage community subscribers and their access
      </p>
    </div>
  );
};
