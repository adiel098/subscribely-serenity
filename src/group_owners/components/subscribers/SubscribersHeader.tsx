
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, Users } from "lucide-react";

interface SubscribersHeaderProps {
  onUpdateStatus: () => void;
  onExport: () => void;
  isUpdating: boolean;
}

export const SubscribersHeader = ({ 
  onUpdateStatus, 
  onExport, 
  isUpdating 
}: SubscribersHeaderProps) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Subscribers</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdateStatus}
            disabled={isUpdating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Update Member Status
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Manage your community subscribers and monitor their subscription status
      </p>
    </div>
  );
};
