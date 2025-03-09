
export interface SubscriptionMember {
  id: string;
  community_id: string;
  telegram_user_id: string;
  subscription_end_date: string | null;
  is_active: boolean;
  subscription_status: string;
}

export interface BotSettings {
  community_id: string;
  auto_remove_expired: boolean;
  expired_subscription_message: string;
  subscription_reminder_days: number;
  subscription_reminder_message: string;
  first_reminder_days: number;
  first_reminder_message: string;
  first_reminder_image: string | null;
  second_reminder_days: number;
  second_reminder_message: string;
  second_reminder_image: string | null;
  bot_signature: string;
}
