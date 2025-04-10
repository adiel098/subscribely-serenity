
export interface BotSettings {
  id?: string;
  project_id?: string;
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
  custom_bot_token?: string;
  created_at?: string;
  updated_at?: string;
}
