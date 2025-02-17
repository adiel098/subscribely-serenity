
declare module 'lovable-tagger' {
  export function componentTagger(): {
    name: string;
    transform: (code: string, id: string) => string | undefined;
  };
}

export interface BotStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalRevenue: number;
  revenuePerSubscriber: number;
  activeSubscribers: number;
  expiredSubscriptions: number;
}

export interface Customer {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  name: string | null;
  email: string | null;
  created_at: string;
  subscription_status: boolean;
  avatar_url?: string;
  joined_at?: string;
  plan?: {
    name: string;
    price: number;
  };
}

export interface StatsGridProps {
  totalRevenue: number;
  activeSubscribers: number;
  totalMembers: number;
  totalEvents: number;
  notifications: number;
}

export interface ChartData {
  date: string;
  events: number;
  revenue: number;
}

export interface CommunitySelectorProps {
  selectedCommunityId: string;
  onSelect: (id: string) => void;
}

export interface CustomerDetailsSheetProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface BroadcastStatus {
  success: boolean;
  message: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  created_at: string;
  amount?: number;
  community_id: string;
}

export interface SubscriberPlan {
  id: string;
  name: string;
  interval: "monthly" | "quarterly" | "half-yearly" | "yearly" | "one-time";
  price: number;
  features?: string[];
  description?: string | null;
}

export interface BroadcastOptions {
  message: string;
  filterType: 'all' | 'active' | 'expired';
  includeButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
}
