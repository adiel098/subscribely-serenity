
export interface BotSettings {
  id: string;
  community_id: string;
  welcome_message: string;
  subscription_reminder_days: number;
  subscription_reminder_message: string;
  auto_remove_expired: boolean;
  expired_subscription_message: string;
  renewal_discount_enabled: boolean;
  renewal_discount_percentage: number;
  max_messages_per_day: number | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  auto_welcome_message: boolean;
  bot_signature: string;
  language: string;
}
