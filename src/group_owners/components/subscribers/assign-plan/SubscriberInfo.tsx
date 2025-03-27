
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubscriberInfoProps {
  user: Subscriber;
}

export const SubscriberInfo = ({ user }: SubscriberInfoProps) => {
  const isMobile = useIsMobile();
  
  // Generate profile image with fallbacks
  const profileImage = user.photo_url || "/images/default-avatar.png";
  
  return (
    <div className={`flex items-center gap-3 ${isMobile ? 'text-xs' : ''}`}>
      <img 
        src={profileImage} 
        alt={user.first_name || "User"}
        className={`rounded-full ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}
      />
      <div>
        <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{user.first_name} {user.last_name}</p>
        <p className="text-gray-500">@{user.telegram_username || 'user'}</p>
      </div>
    </div>
  );
};
