
export const useFilteredSubscribers = (subscribers: any[], timeRangeStartDate: Date | null) => {
  // Filter subscribers based on time range
  const filteredSubscribers = subscribers.filter(subscriber => {
    if (!timeRangeStartDate) return true; // All time
    
    const joinedDate = subscriber.joined_at ? new Date(subscriber.joined_at) : null;
    if (!joinedDate) return true; // Include if no join date
    
    return joinedDate >= timeRangeStartDate;
  });
  
  // Separate active and inactive subscribers
  const activeSubscribers = filteredSubscribers.filter(subscriber => 
    subscriber.subscription_status === true || 
    subscriber.subscription_status === 'active'
  );
  
  const inactiveSubscribers = filteredSubscribers.filter(subscriber => 
    subscriber.subscription_status === false || 
    subscriber.subscription_status === 'inactive' || 
    subscriber.subscription_status === null
  );
  
  return {
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers
  };
};
