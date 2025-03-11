
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  telegram_photo_url: string | null;
  telegram_invite_link: string | null;
  telegram_chat_id: string | null;
  custom_link: string | null;
  member_count: number;
  subscription_count: number;
  subscription_plans: SubscriptionPlan[];
  is_group?: boolean; // New field to identify if this is a group
  communities?: Community[]; // For groups, contains the included communities
}
