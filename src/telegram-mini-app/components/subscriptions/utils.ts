
import { Subscription } from "../../services/memberService";

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export const isSubscriptionActive = (subscription: Subscription) => {
  if (!subscription.subscription_end_date && !subscription.expiry_date) return false;
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  return endDate ? new Date(endDate) > new Date() : false;
};

export const getDaysRemaining = (subscription: Subscription) => {
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  if (!endDate) return 0;
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const getTimeRemainingText = (subscription: Subscription) => {
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  if (!endDate) return "Expired";
  
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  
  if (diffMs <= 0) return "Expired";
  
  // Calculate days, hours, minutes
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
};
