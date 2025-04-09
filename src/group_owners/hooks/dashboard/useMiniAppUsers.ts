
export const useMiniAppUsers = (subscribers: any[]) => {
  // Count mini app users
  const miniAppUsersCount = subscribers.filter(s => 
    s.metadata?.mini_app_accessed === true
  ).length;
  
  // Calculate percentage
  const miniAppPercentage = subscribers.length > 0
    ? (miniAppUsersCount / subscribers.length) * 100
    : 0;
  
  return {
    miniAppUsers: {
      count: miniAppUsersCount,
      percentage: miniAppPercentage,
      nonSubscribers: 0 // Added to match expected interface
    }
  };
};
