
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Subscribers
            </h1>
            <p className="text-sm text-gray-500">
              Manage your community subscribers and monitor their subscription status
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onUpdateStatus}
            disabled={isUpdating}
            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            Update Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <div className="h-1 w-16 bg-blue-500 rounded-full"></div>
    </div>
  );
};
