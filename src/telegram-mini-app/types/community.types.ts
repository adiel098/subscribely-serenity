
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
