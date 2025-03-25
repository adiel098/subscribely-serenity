
import { Subscriber } from "../../hooks/useSubscribers";

interface SubscribersStatsProps {
  subscribers: Subscriber[];
}

export const SubscribersStats = ({ subscribers }: SubscribersStatsProps) => {
  return (
    <div className="flex gap-3">
      <div className="bg-white/90 rounded-lg p-3 border-2 border-indigo-100 shadow-sm text-center">
        <div className="text-xl font-bold text-indigo-600">{subscribers.length}</div>
        <div className="text-xs text-gray-600">Total</div>
      </div>
      
      <div className="bg-white/90 rounded-lg p-3 border-2 border-green-100 shadow-sm text-center">
        <div className="text-xl font-bold text-green-600">
          {subscribers.filter(sub => sub.subscription_status === 'active').length}
        </div>
        <div className="text-xs text-gray-600">Active</div>
      </div>
      
      <div className="bg-white/90 rounded-lg p-3 border-2 border-amber-100 shadow-sm text-center">
        <div className="text-xl font-bold text-amber-600">
          {subscribers.filter(sub => sub.subscription_status !== 'active').length}
        </div>
        <div className="text-xs text-gray-600">Inactive</div>
      </div>
    </div>
  );
};
