
export type PlatformPlanInterval = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface PlatformPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: PlatformPlanInterval;
  features: string[];
  is_active: boolean;
  max_communities: number;
  max_members_per_community: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePlatformPlanData {
  name: string;
  description?: string;
  price: number;
  interval: PlatformPlanInterval;
  features?: string[];
  is_active?: boolean;
  max_communities?: number;
  max_members_per_community?: number | null;
}

export interface UpdatePlatformPlanData {
  id: string;
  name?: string;
  description?: string | null;
  price?: number;
  interval?: PlatformPlanInterval;
  features?: string[];
  is_active?: boolean;
  max_communities?: number;
  max_members_per_community?: number | null;
}
