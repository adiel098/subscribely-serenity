
export type SubscriptionInterval = 
  | "monthly" 
  | "quarterly" 
  | "half_yearly" 
  | "yearly" 
  | "one-time" 
  | "lifetime";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  interval: SubscriptionInterval;
  features: string[];
  is_active: boolean;
  project_id: string;
  community_id?: string | null;
  has_trial_period: boolean;
  trial_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlanParams {
  name: string;
  description?: string | null;
  price: number;
  interval: SubscriptionInterval;
  features: string[];
  project_id: string;
  community_id?: string;
  has_trial_period?: boolean;
  trial_days?: number;
}

export interface CreateSubscriptionPlanParams extends CreatePlanParams {}

export interface UpdatePlanParams {
  id: string;
  name?: string;
  description?: string | null;
  price?: number;
  interval?: SubscriptionInterval;
  features?: string[];
  has_trial_period?: boolean;
  trial_days?: number;
  updates?: Partial<SubscriptionPlan>;
}

export interface TogglePlanStatusParams {
  id: string;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  provider: string;
  config?: any;
  is_active: boolean;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface BotSettings {
  id?: string;
  project_id?: string;
  community_id?: string;
  welcome_message?: string;
  welcome_image?: string | null;
  expired_subscription_message?: string;
  first_reminder_days?: number;
  first_reminder_message?: string;
  first_reminder_image?: string | null;
  second_reminder_days?: number;
  second_reminder_message?: string;
  second_reminder_image?: string | null;
  use_custom_bot?: boolean;
  custom_bot_token?: string | null;
  created_at?: string;
  updated_at?: string;
}
