
export const useRevenueStats = (subscribers: any[]) => {
  // Calculate total revenue based on subscriber payments
  // This is a simplified implementation
  const totalRevenue = subscribers.reduce((sum, subscriber) => {
    const planPrice = subscriber.plan?.price || 0;
    return sum + planPrice;
  }, 0);
  
  // Calculate average revenue per subscriber
  const avgRevenuePerSubscriber = subscribers.length > 0
    ? totalRevenue / subscribers.length
    : 0;
  
  // Calculate conversion rate (active vs total)
  const activeCount = subscribers.filter(s => 
    s.subscription_status === true || 
    s.subscription_status === 'active'
  ).length;
  
  const conversionRate = subscribers.length > 0
    ? (activeCount / subscribers.length) * 100
    : 0;
  
  return {
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate
  };
};
