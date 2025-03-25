
import { RefreshCw, FileSpreadsheet, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubscribersHeaderProps {
  onUpdateStatus: (status: string) => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({
  onUpdateStatus,
  onExport,
  isUpdating
}: SubscribersHeaderProps) => {
  return <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
          Subscribers <Sparkles className="h-5 w-5 ml-1 text-amber-400" />
        </h1>
        <p className="text-sm text-muted-foreground ml-4">
          Manage community subscribers and their access
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onUpdateStatus('all')}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onExport}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>;
};
