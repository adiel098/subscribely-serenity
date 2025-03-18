
import { Subscriber } from "../../hooks/useSubscribers";

interface SubscribersStatsProps {
  subscribers: Subscriber[];
}

export const SubscribersStats = ({ subscribers }: SubscribersStatsProps) => {
  return (
    <div className="w-full md:w-5/12">
      <div className="grid grid-cols-3 gap-3 h-full">
        <div className="bg-white/90 rounded-lg p-4 border-2 border-indigo-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-indigo-600">{subscribers.length}</div>
          <div className="text-sm text-gray-600">Total Subscribers</div>
        </div>
        
        <div className="bg-white/90 rounded-lg p-4 border-2 border-green-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">
            {subscribers.filter(sub => sub.subscription_status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Subscribers</div>
        </div>
        
        <div className="bg-white/90 rounded-lg p-4 border-2 border-amber-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-amber-600">
            {subscribers.filter(sub => sub.subscription_status !== 'active').length}
          </div>
          <div className="text-sm text-gray-600">Inactive Subscribers</div>
        </div>
      </div>
    </div>
  );
};
