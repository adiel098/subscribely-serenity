
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
  return <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-6">
        <SubscribersHeader onUpdateStatus={() => {}} onExport={onExport} isUpdating={isUpdating} />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1" disabled={isUpdating} onClick={() => {}}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={onExport}>
          <FileSpreadsheet className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>;
};
