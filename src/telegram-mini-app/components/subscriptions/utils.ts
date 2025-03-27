
import { Subscription } from "../../services/memberService";
import { getDetailedTimeRemaining } from "@/utils/dateUtils";

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
  if (subscription.subscription_status !== "active") {
    return false;
  }
  
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  if (!endDate) {
    return false;
  }
  
  const now = new Date();
  const expiryDate = new Date(endDate);
  return expiryDate > now;
}

export function getDaysRemaining(subscription: Subscription): number {
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  if (!endDate) return 0;
  
  const now = new Date();
  const expiryDate = new Date(endDate);
  const msRemaining = expiryDate.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)));
}

export function getTimeRemainingText(subscription: Subscription): string {
  if (subscription.subscription_status !== "active") {
    return "Expired";
  }
  
  const endDate = subscription.subscription_end_date || subscription.expiry_date;
  return getDetailedTimeRemaining(endDate);
}
