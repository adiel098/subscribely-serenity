import { SubscriptionPlan } from "../../types/subscriptionTypes";

// Community type definition
export interface Community {
  id: string;
  name: string;
  description: string;
  telegram_group_id: string;
  telegram_photo_url?: string;
  is_public?: boolean;
  is_group?: boolean;
  platform_url?: string;
  miniapp_url?: string;
  project_plans: SubscriptionPlan[];
}
