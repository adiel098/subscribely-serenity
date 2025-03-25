
export interface TelegramMiniAppUser {
  id: string;
  telegram_id: string;
  community_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  photo_url?: string | null;
  email?: string | null;
  created_at?: string | null;
  last_active?: string | null;
  is_suspended?: boolean | null;
}

export type SubscriptionStatus = 'active' | 'expired' | 'removed' | 'inactive' | 'trial';

export interface Database {
  public: {
    Tables: {
      telegram_mini_app_users: {
        Row: TelegramMiniAppUser;
        Insert: Omit<TelegramMiniAppUser, 'id' | 'created_at' | 'last_active'>;
        Update: Partial<Omit<TelegramMiniAppUser, 'id' | 'created_at'>>;
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          telegram_photo_url: string | null;
          telegram_invite_link: string | null;
          chat_type: string | null; // Added chat_type field to store Telegram chat type (channel, group, supergroup)
          is_group: boolean | null; // This now represents platform groups, not Telegram groups
          is_active: boolean | null;
          bot_status: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          interval: string;
          features: string[];
          community_id: string;
          created_at?: string | null;
          updated_at?: string | null;
          is_active: boolean;
        };
      };
      community_subscribers: {
        Row: {
          id: string;
          telegram_user_id: string;
          telegram_username: string | null;
          community_id: string;
          joined_at: string;
          last_active: string | null;
          subscription_status: SubscriptionStatus;
          is_active: boolean;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
        };
      };
    };
  };
}
