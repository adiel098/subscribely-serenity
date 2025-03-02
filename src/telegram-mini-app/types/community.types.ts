
export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
  community_id: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  telegram_photo_url: string | null;
  telegram_invite_link: string | null;
  subscription_plans: Plan[];
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
