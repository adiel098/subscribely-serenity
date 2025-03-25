
import { SubscribersHeader } from "./SubscribersHeader";
import { SubscribersStats } from "./SubscribersStats";
import { Subscriber } from "../../hooks/useSubscribers";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileSpreadsheet } from "lucide-react";

interface SubscribersHeaderSectionProps {
  subscribers: Subscriber[];
  isGroupSelected: boolean;
  isUpdating: boolean;
  onExport: () => void;
}

export const SubscribersHeaderSection = ({
  subscribers,
  isGroupSelected,
  isUpdating,
  onExport
}: SubscribersHeaderSectionProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <SubscribersHeader 
          onUpdateStatus={() => {}} 
          onExport={onExport} 
          isUpdating={isUpdating} 
        />
        <SubscribersStats subscribers={subscribers} />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {}}
          disabled={isUpdating}
          className="h-10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          Update Status
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onExport}
          className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200 h-10"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};
