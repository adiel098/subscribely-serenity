
export interface TelegramChat {
  id: string;
  title: string;
  username?: string;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  members_count?: number;
  photo_url?: string;
}
