
declare module 'lovable-tagger' {
  export function componentTagger(): {
    name: string;
    transform: (code: string, id: string) => string | undefined;
  };
}

interface StatsGridProps {
  totalRevenue: number;
  activeSubscribers: number;
  totalMembers: number;
  totalEvents: number;
  notifications: number;
}

interface ChartData {
  date: string;
  events: number;
  revenue: number;
}

interface CommunitySelectorProps {
  selectedCommunityId: string;
  onSelect: (id: string) => void;
}

interface BroadcastStatus {
  success: boolean;
  message: string;
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  created_at: string;
  amount?: number;
}

interface SubscriberPlan {
  id: string;
  name: string;
  interval: string;
  price: number;
}
