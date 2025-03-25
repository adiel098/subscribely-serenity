
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
  return (
    <div className="flex items-center justify-between gap-6">
      <SubscribersHeader 
        onUpdateStatus={() => {}} 
        onExport={onExport} 
        isUpdating={isUpdating} 
      />
      <SubscribersStats subscribers={subscribers} />
    </div>
  );
};
