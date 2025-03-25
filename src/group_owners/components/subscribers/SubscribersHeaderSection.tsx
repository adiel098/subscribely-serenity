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
  return <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <SubscribersHeader onUpdateStatus={() => {}} onExport={onExport} isUpdating={isUpdating} />
        <SubscribersStats subscribers={subscribers} />
      </div>
      
      
    </div>;
};