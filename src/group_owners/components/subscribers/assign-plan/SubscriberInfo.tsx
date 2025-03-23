
import { CreditCard } from "lucide-react";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface SubscriberInfoProps {
  user: Subscriber;
}

export const SubscriberInfo = ({ user }: SubscriberInfoProps) => {
  return (
    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
        <CreditCard className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <h3 className="text-sm font-medium">Assigning plan to:</h3>
        <p className="text-sm text-gray-700">
          {user.first_name} {user.last_name} 
          {user.telegram_username ? ` (@${user.telegram_username})` : ''}
        </p>
      </div>
    </div>
  );
};
