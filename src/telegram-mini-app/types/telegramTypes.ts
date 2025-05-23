
export interface TelegramUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
}

export interface TelegramUserHookResult {
  user: TelegramUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
