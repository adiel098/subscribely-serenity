
import { Subscriber } from "../../hooks/useSubscribers";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscribersStatsProps {
  subscribers: Subscriber[];
  isMobile?: boolean;
}

export const SubscribersStats = ({ subscribers, isMobile: propIsMobile }: SubscribersStatsProps) => {
  const hookIsMobile = useIsMobile();
  const isMobile = propIsMobile !== undefined ? propIsMobile : hookIsMobile;
  
  const activeCount = subscribers.filter(sub => sub.subscription_status === 'active').length;
  const inactiveCount = subscribers.filter(sub => sub.subscription_status !== 'active').length;
  
  return (
    <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
      <div className={`bg-white/90 rounded-lg ${isMobile ? 'p-2' : 'p-3'} border-2 border-indigo-100 shadow-sm text-center`}>
        <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-indigo-600`}>
          {subscribers.length}
        </div>
        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
          Total Subscribers
        </div>
      </div>
      
      <div className={`bg-white/90 rounded-lg ${isMobile ? 'p-2' : 'p-3'} border-2 border-green-100 shadow-sm text-center`}>
        <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-green-600`}>
          {activeCount}
        </div>
        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
          Active Subscribers
        </div>
      </div>
      
      <div className={`bg-white/90 rounded-lg ${isMobile ? 'p-2' : 'p-3'} border-2 border-amber-100 shadow-sm text-center`}>
        <div className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-amber-600`}>
          {inactiveCount}
        </div>
        <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-600`}>
          Inactive Subscribers
        </div>
      </div>
    </div>
  );
};
