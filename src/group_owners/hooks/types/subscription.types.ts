
import { convertSubscriptionInterval } from "@/shared/types/subscription.types";

export type SubscriptionInterval = 
  | 'monthly'
  | 'quarterly' 
  | 'half_yearly'
  | 'yearly'
  | 'lifetime'
  | 'one_time';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  interval: SubscriptionInterval;
  features?: string[];
  is_active: boolean;
  project_id?: string;
  community_id?: string;
  has_trial_period: boolean;
  trial_days: number;
  created_at: string;
  updated_at: string;
  duration?: number;
  duration_type?: string;
}

export interface CreateSubscriptionPlanParams {
  name: string;
  description?: string;
  price: number;
  interval: string;
  features?: string[];
  project_id: string;
  community_id?: string;
  has_trial_period?: boolean;
  trial_days?: number;
}

export interface UpdatePlanParams {
  id: string;
  updates: Partial<SubscriptionPlan>;
}

export interface TogglePlanStatusParams {
  id: string;
  is_active: boolean;
}

export type PaymentMethod = {
  id: string;
  provider: string;
  is_active: boolean;
  config: PaymentMethodConfig;
  created_at: string;
  updated_at: string;
};

export type PaymentMethodConfig = {
  api_key?: string;
  webhook_secret?: string;
  merchant_id?: string;
  wallet_address?: string;
  [key: string]: any;
};

export interface BotSettings {
  id: string;
  welcome_message?: string;
  subscription_reminder_message?: string;
  expired_subscription_message?: string;
  language?: string;
  welcome_image?: string;
  first_reminder_message?: string;
  first_reminder_image?: string;
  second_reminder_message?: string;
  second_reminder_image?: string;
  subscription_reminder_days?: number;
  renewal_discount_enabled?: boolean;
  renewal_discount_percentage?: number;
  first_reminder_days?: number;
  second_reminder_days?: number;
  project_id?: string;
  community_id?: string;
  use_custom_bot?: boolean;
  custom_bot_token?: string | null;
  created_at: string;
  updated_at: string;
}
