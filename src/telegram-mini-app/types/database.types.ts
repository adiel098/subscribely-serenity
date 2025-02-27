
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
}

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
        };
      };
    };
  };
}
