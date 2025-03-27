
import { addDays, addMonths, addYears, format } from "date-fns";

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
    const hoursRemaining = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60)) % 60;
    console.log(`Trial period: ${trialDays} days (${hoursRemaining} hours, ${minutesRemaining} minutes) until ${format(endDate, 'MMM d, yyyy HH:mm')}`);
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
  
  // Calculate the exact time remaining
  const daysRemaining = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) % 24;
  const minutesRemaining = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60)) % 60;
  
  console.log(`Subscription period: ${daysRemaining} days, ${hoursRemaining} hours, ${minutesRemaining} minutes until ${format(endDate, 'MMM d, yyyy HH:mm')}`);
  
  return { startDate, endDate };
};

/**
 * Calculate the end date for a free trial based on the number of days
 */
export const calculateTrialEndDate = (
  trialDays: number = 0
): Date => {
  const startDate = new Date();
  const endDate = addDays(startDate, trialDays);
  
  // Calculate the exact time remaining
  const hoursRemaining = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) % 24;
  const minutesRemaining = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60)) % 60;
  
  console.log(`Trial period: ${trialDays} days (${hoursRemaining} hours, ${minutesRemaining} minutes) until ${format(endDate, 'MMM d, yyyy HH:mm')}`);
  
  return endDate;
};
