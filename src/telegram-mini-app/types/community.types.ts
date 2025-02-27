
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
}
