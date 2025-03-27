
import { addDays, addMonths, addYears } from "date-fns";

interface SubscriptionDates {
  startDate: Date;
  endDate: Date;
}

/**
 * Calculate subscription start and end dates based on the interval and trial period
 */
export const calculateSubscriptionDates = (
  interval?: string,
  hasTrial: boolean = false,
  trialDays: number = 0
): SubscriptionDates => {
  const startDate = new Date();
  let endDate = new Date(startDate);
  
  // If there's a trial period, set the start date to now and add trial days
  if (hasTrial && trialDays > 0) {
    endDate = addDays(startDate, trialDays);
    console.log(`Trial period: ${trialDays} days until ${endDate.toISOString()}`);
    return { startDate, endDate };
  }
  
  // Calculate end date based on interval
  if (interval) {
    switch (interval) {
      case 'monthly':
        endDate = addMonths(startDate, 1);
        break;
      case 'quarterly':
        endDate = addMonths(startDate, 3);
        break;
      case 'half-yearly':
        endDate = addMonths(startDate, 6);
        break;
      case 'yearly':
        endDate = addMonths(startDate, 12);
        break;
      case 'one-time':
      case 'lifetime':
        // For one-time or lifetime, set a far future date
        endDate = addYears(startDate, 100);
        break;
      default:
        // Default to 1 month
        endDate = addMonths(startDate, 1);
    }
  } else {
    // Default to 1 month if no interval is provided
    endDate = addMonths(startDate, 1);
  }
  
  return { startDate, endDate };
};

/**
 * Calculate the end date for a free trial based on the number of days
 */
export const calculateTrialEndDate = (
  trialDays: number = 0
): Date => {
  const startDate = new Date();
  return addDays(startDate, trialDays);
};
