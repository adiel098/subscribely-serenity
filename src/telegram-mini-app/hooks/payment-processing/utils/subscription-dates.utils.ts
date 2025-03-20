
/**
 * Calculate subscription start and end dates based on the plan interval
 */
export const calculateSubscriptionDates = (planInterval?: string) => {
  const startDate = new Date();
  let endDate = new Date(startDate);
  
  // Add time based on plan interval
  if (planInterval) {
    switch (planInterval) {
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case "half-yearly":
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "one-time":
      case "one_time":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case "lifetime":
        endDate.setFullYear(endDate.getFullYear() + 100);
        break;
      default:
        // Default to 30 days if interval not recognized
        endDate.setDate(endDate.getDate() + 30);
    }
    console.log(`[SubscriptionDatesUtils] Calculated subscription dates: Start=${startDate.toISOString()}, End=${endDate.toISOString()}`);
  }
  
  return {
    startDate,
    endDate
  };
};
