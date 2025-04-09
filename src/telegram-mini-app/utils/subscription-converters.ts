
import { SubscriptionPlan as GlobalSubscriptionPlan } from '@/types';
import { SubscriptionPlan as GroupOwnerSubscriptionPlan } from '@/group_owners/hooks/types/subscription.types';

/**
 * Converts a subscription plan from the group_owners format to the global format
 */
export const convertToGlobalPlan = (plan: GroupOwnerSubscriptionPlan): GlobalSubscriptionPlan => {
  // Map interval to duration and duration_type
  let duration = 1;
  let duration_type: 'days' | 'months' | 'years' = 'months';
  
  switch (plan.interval) {
    case 'monthly':
      duration = 1;
      duration_type = 'months';
      break;
    case 'quarterly':
      duration = 3;
      duration_type = 'months';
      break;
    case 'half-yearly':
      duration = 6;
      duration_type = 'months';
      break;
    case 'yearly':
      duration = 1;
      duration_type = 'years';
      break;
    case 'one-time':
    case 'lifetime':
      duration = 100;
      duration_type = 'years'; // Effectively lifetime
      break;
  }
  
  return {
    ...plan,
    duration,
    duration_type,
  };
};

/**
 * Converts an array of subscription plans from the group_owners format to the global format
 */
export const convertToGlobalPlans = (
  plans: GroupOwnerSubscriptionPlan[]
): GlobalSubscriptionPlan[] => {
  return plans.map(convertToGlobalPlan);
};
