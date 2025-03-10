import { Subscription } from "../../services/memberService";

export function formatDate(date: string | null | undefined): string {
  if (!date) return "N/A";
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  if (subscription.subscription_status !== "active") return false;
  
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  if (!endDate) return false;
  
  return new Date(endDate) > new Date();
}

export function getDaysRemaining(subscription: Subscription): number {
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  if (!endDate) return 0;
  
  const now = new Date();
  const expiryDate = new Date(endDate);
  const msRemaining = expiryDate.getTime() - now.getTime();
  
  // Use Math.floor to ensure we don't round up to 1 when less than a day remains
  return Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)));
}

export function getTimeRemainingText(subscription: Subscription): string {
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  if (!endDate) return "Expired";
  
  const now = new Date();
  const expiryDate = new Date(endDate);
  const msRemaining = expiryDate.getTime() - now.getTime();
  
  // If already expired
  if (msRemaining <= 0) {
    return "Expired";
  }
  
  // If less than 24 hours remaining, show hours and minutes
  if (msRemaining < 24 * 60 * 60 * 1000) {
    const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m left`;
    } else {
      return `${minutesRemaining}m left`;
    }
  }
  
  // Otherwise, show days
  const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  return `${daysRemaining} days left`;
}
