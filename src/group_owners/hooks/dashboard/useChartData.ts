
import { format, subDays, differenceInDays } from "date-fns";

export const useChartData = (filteredSubscribers: any[]) => {
  // Generate example chart data for member growth
  const memberGrowthData = generateMemberGrowthData(filteredSubscribers);
  
  // Generate example chart data for revenue
  const revenueData = generateRevenueData(filteredSubscribers);
  
  return {
    memberGrowthData,
    revenueData
  };
};

// Helper function to generate member growth data
function generateMemberGrowthData(subscribers: any[]) {
  const today = new Date();
  const data = [];
  
  // Create a data point for each of the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const formattedDate = format(date, 'MMM dd');
    
    // Count subscribers who joined on or before this date
    const subscriberCount = subscribers.filter(sub => {
      if (!sub.joined_at) return false;
      const joinDate = new Date(sub.joined_at);
      return differenceInDays(date, joinDate) >= 0;
    }).length;
    
    data.push({
      date: formattedDate,
      subscribers: subscriberCount
    });
  }
  
  return data;
}

// Helper function to generate revenue data
function generateRevenueData(subscribers: any[]) {
  const today = new Date();
  const data = [];
  
  // Create a data point for each of the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i);
    const formattedDate = format(date, 'MMM dd');
    
    // Calculate revenue from subscribers who joined on or before this date
    let revenue = 0;
    subscribers.forEach(sub => {
      if (!sub.joined_at) return;
      const joinDate = new Date(sub.joined_at);
      if (differenceInDays(date, joinDate) >= 0) {
        revenue += sub.plan?.price || 0;
      }
    });
    
    data.push({
      date: formattedDate,
      revenue
    });
  }
  
  return data;
}
