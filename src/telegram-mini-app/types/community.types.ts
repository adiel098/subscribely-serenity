
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  telegram_photo_url: string | null;
  telegram_invite_link: string | null;
  telegram_chat_id: string | null;
  custom_link: string | null;
  photo_url?: string | null;
  member_count?: number;
  subscription_count?: number;
  subscription_plans: SubscriptionPlan[];
  is_group?: boolean; // Field to identify if this is a group
  communities?: Community[]; // For groups, contains the included communities
}

// Add the Plan type that was missing and causing errors
export type Plan = SubscriptionPlan;

// Fix the CommunityCard component comparison by adding this subscription interval type
export type SubscriptionInterval = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';

// Adding Subscription type that was missing in subscriptionService.ts
export interface Subscription {
  id: string;
  user_id: string;
  community_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  created_at: string;
  expires_at: string | null;
  plan?: Plan;
  community?: Community;
}
