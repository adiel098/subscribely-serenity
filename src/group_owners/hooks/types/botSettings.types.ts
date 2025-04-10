
export interface BotSettings {
  id?: string;
  project_id: string;
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
  subscription_reminder_days?: number;
  subscription_reminder_message?: string;
  renewal_discount_enabled?: boolean;
  renewal_discount_percentage?: number;
  language?: string;
  bot_signature?: string;
  auto_welcome_message?: boolean;
  auto_remove_expired?: boolean;
  created_at?: string;
  updated_at?: string;
}
