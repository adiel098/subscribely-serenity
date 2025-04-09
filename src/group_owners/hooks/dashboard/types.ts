
export interface MiniAppData {
  count: number;
  nonSubscribers: number;
}

export interface DashboardSubscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  community_id: string;
  joined_at: string;
  is_active: boolean;
  last_active: string | null;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  first_name: string | null;
  last_name: string | null;
  plan?: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features?: string[];
  } | null;
}
