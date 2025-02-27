
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
