
import React from "react";
import { UserProfileCard } from "./UserProfileCard";
import { ExpirationWarning } from "../subscriptions/ExpirationWarning";
import { Subscription } from "../../services/memberService";
import { isSubscriptionActive } from "../subscriptions/utils";

interface UserProfileProps {
  telegramUser: any;
  subscriptions?: any[];
  onRenew: (subscription: any) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  telegramUser,
  subscriptions = [],
  onRenew
}) => {
  // Find the first active subscription that is about to expire
  const expiringSubscription = subscriptions?.find(sub => 
    isSubscriptionActive(sub) && 
    (new Date(sub.subscription_end_date || sub.expiry_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  );
  
  return (
    <>
      <UserProfileCard 
        name={telegramUser.first_name ? 
          `${telegramUser.first_name} ${telegramUser.last_name || ''}` : 
          'Telegram User'
        }
        username={telegramUser.username}
        photoUrl={telegramUser.photo_url}
        email={telegramUser.email}
      />
      
      {expiringSubscription && (
        <ExpirationWarning 
          subscription={expiringSubscription} 
          onRenew={onRenew} 
        />
      )}
    </>
  );
};
