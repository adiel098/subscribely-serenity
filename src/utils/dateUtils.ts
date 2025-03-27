
import { addDays, differenceInDays, differenceInHours, differenceInMinutes, format } from "date-fns";

/**
 * Format a date in a standard readable format
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), 'MMMM dd, yyyy');
  } catch (e) {
    return dateStr || 'N/A';
  }
};

/**
 * Calculate days remaining until a given date
 */
export const calculateDaysRemaining = (endDateStr: string | null | undefined): number => {
  if (!endDateStr) return 0;
  try {
    const endDate = new Date(endDateStr);
    const today = new Date();
    return Math.max(0, differenceInDays(endDate, today));
  } catch (e) {
    return 0;
  }
};

/**
 * Get detailed time remaining for subscription in format "X days Y hours Z minutes"
 * 
 * @param endDateStr The subscription end date
 * @returns Formatted string with detailed time remaining
 */
export const getDetailedTimeRemaining = (endDateStr: string | null | undefined): string => {
  if (!endDateStr) return "Expired";
  
  try {
    const endDate = new Date(endDateStr);
    const now = new Date();
    
    // If already expired
    if (endDate <= now) {
      return "Expired";
    }
    
    const days = differenceInDays(endDate, now);
    const remainingHours = differenceInHours(endDate, addDays(now, days));
    const remainingMinutes = differenceInMinutes(
      endDate, 
      addDays(now, days)
    ) % 60;
    
    // Format the string based on what values are available
    if (days > 0) {
      return `${days} days ${remainingHours} hours ${remainingMinutes} minutes`;
    } else if (remainingHours > 0) {
      return `${remainingHours} hours ${remainingMinutes} minutes`;
    } else {
      return `${remainingMinutes} minutes`;
    }
  } catch (e) {
    console.error("Error calculating time remaining:", e);
    return "Unknown";
  }
};
