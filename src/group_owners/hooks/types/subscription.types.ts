
// Subscription plan types
export type SubscriptionInterval = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly' | 'lifetime' | 'one-time';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: SubscriptionInterval;
  features: string[];
  is_active: boolean;
  project_id: string;
  community_id?: string;
  has_trial_period: boolean;
  trial_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanParams {
  name: string;
  description: string;
  price: number;
  interval: SubscriptionInterval;
  features: string[];
  project_id: string;
  community_id?: string;
  has_trial_period?: boolean;
  trial_days?: number;
}

export interface UpdatePlanParams {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  interval?: SubscriptionInterval;
  features?: string[];
  has_trial_period?: boolean;
  trial_days?: number;
}

export interface TogglePlanStatusParams {
  id: string;
  is_active: boolean;
}

export interface BotSettings {
  welcome_message: string;
  expired_message: string;
  removed_message: string;
  reminder_message: string;
  auto_remove_expired: boolean;
  auto_remove_days: number;
  send_reminders: boolean;
  reminder_days: number;
  project_id: string;
  community_id?: string;
  use_custom_bot?: boolean;
  custom_bot_token?: string | null;
  created_at: string;
  updated_at: string;
}

// Payment method types
export interface PaymentMethod {
  id: string;
  provider: string;
  config: Record<string, any>;
  is_active: boolean;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}
