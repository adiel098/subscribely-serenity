
export interface Community {
  id: string;
  name: string;
  description: string | null;
  telegram_photo_url: string | null;
  telegram_invite_link: string | null;
  subscription_plans: any[];
  member_count: number;
}

export interface Subscription {
  id: string;
  status: string;
  created_at: string;
  expiry_date: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  community: Community;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features?: string[];
  } | null;
}

export interface CreateMemberData {
  telegram_id: string;
  community_id: string;
  subscription_plan_id: string;
  status?: 'active' | 'inactive' | 'pending';
  payment_id?: string;
}

export interface UserExistsResponse {
  exists: boolean;
  hasEmail: boolean;
}
