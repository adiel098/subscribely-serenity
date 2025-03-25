
import { SubscribersHeader } from "./SubscribersHeader";
import { SubscribersStats } from "./SubscribersStats";
import { Subscriber } from "../../hooks/useSubscribers";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileSpreadsheet } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center justify-between'}`}>
      <div className={`${isMobile ? 'w-full' : 'flex items-center gap-6'}`}>
        <SubscribersHeader 
          onUpdateStatus={() => {}} // Updated to pass a function with no parameters
          onExport={onExport} 
          isUpdating={isUpdating} 
        />
        {!isMobile && <SubscribersStats subscribers={subscribers} />}
      </div>
      
      {isMobile && (
        <div className="w-full overflow-auto">
          <SubscribersStats subscribers={subscribers} isMobile={true} />
        </div>
      )}
    </div>
  );
};
