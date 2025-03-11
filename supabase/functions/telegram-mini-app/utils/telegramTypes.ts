
export interface WebAppUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  email?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: WebAppUser;
  auth_date?: number;
  hash?: string;
}

export interface RequestBody {
  start?: string;
  initData?: string;
}

export interface CommunityResponse {
  community: any;
  user: WebAppUser | null;
}
