
import { SubscriptionPlan } from "./subscriptionTypes";

export interface Community {
  id: string;
  name: string;
  description: string;
  telegram_photo_url?: string;
  telegram_chat_id?: string;
  custom_link?: string;
  is_group?: boolean;
  platform_url?: string;
  miniapp_url?: string;
  subscription_plans: SubscriptionPlan[];
}

export interface Plan extends SubscriptionPlan {
  description: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  community_id: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  payment_method: string;
  created_at?: string;
  updated_at?: string;
}
