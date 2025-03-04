
import { differenceInDays, format } from "date-fns";

/**
 * Format a date in a readable format
 */
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'N/A';
  try {
    return format(new Date(dateStr), 'MMMM dd, yyyy');
  } catch (e) {
    return dateStr;
  }
};

/**
 * Calculate days remaining until a given date
 */
export const calculateDaysRemaining = (endDateStr: string | null): number => {
  if (!endDateStr) return 0;
  try {
    const endDate = new Date(endDateStr);
    const today = new Date();
    return Math.max(0, differenceInDays(endDate, today));
  } catch (e) {
    return 0;
  }
};
