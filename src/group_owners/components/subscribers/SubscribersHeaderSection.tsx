import { FolderKanban } from "lucide-react";
import { SubscribersHeader } from "./SubscribersHeader";
import { SubscribersStats } from "./SubscribersStats";
import { Subscriber } from "../../hooks/useSubscribers";
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
  return <div className="flex flex-col md:flex-row gap-4">
      <div className="w-full md:w-7/12">
        <SubscribersHeader onUpdateStatus={() => {}} onExport={onExport} isUpdating={isUpdating} />
        {isGroupSelected && <div className="flex items-center mt-2">
            
          </div>}
      </div>
      <SubscribersStats subscribers={subscribers} />
    </div>;
};