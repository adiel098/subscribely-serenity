
import { RefreshCw, FileSpreadsheet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

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
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
          Subscribers <Sparkles className="h-5 w-5 ml-1 text-amber-400" />
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Manage community subscribers and their access
      </p>
      <div className="flex items-center gap-3 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateStatus("all")}
          disabled={isUpdating}
          className="h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isUpdating ? 'animate-spin' : ''}`} />
          Update Status
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-8"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>
      </div>
    </div>
  );
};
