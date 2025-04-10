
export type SubscriptionInterval = 
  | 'monthly'
  | 'quarterly' 
  | 'half_yearly'
  | 'yearly'
  | 'lifetime'
  | 'one_time';
  
export const subscriptionIntervalMapping = {
  'monthly': 'Monthly',
  'quarterly': 'Quarterly',
  'half_yearly': 'Half Yearly',
  'yearly': 'Yearly',
  'lifetime': 'Lifetime',
  'one_time': 'One Time'
};

// Map between different naming conventions for intervals
export const subscriptionIntervalMap = {
  'monthly': 'monthly',
  'quarterly': 'quarterly',
  'half_yearly': 'half-yearly',
  'half-yearly': 'half_yearly',
  'yearly': 'yearly',
  'lifetime': 'lifetime',
  'one_time': 'one-time',
  'one-time': 'one_time'
};

export const convertSubscriptionInterval = (interval: string): SubscriptionInterval => {
  return subscriptionIntervalMap[interval as keyof typeof subscriptionIntervalMap] as SubscriptionInterval || 'monthly';
};
