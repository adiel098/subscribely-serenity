
export const useTrialUsers = (subscribers: any[]) => {
  // Count trial users
  const trialCount = subscribers.filter(s => s.is_trial).length;
  
  // Calculate percentage
  const trialPercentage = subscribers.length > 0
    ? (trialCount / subscribers.length) * 100
    : 0;
  
  return {
    trialUsers: {
      count: trialCount,
      percentage: trialPercentage
    }
  };
};
