export interface BroadcastRequest {
  entityId: string;
  entityType?: 'community' | 'group';
  message: string;
  filterType?: 'all' | 'active' | 'expired' | 'plan';
  includeButton?: boolean;
  buttonText?: string;
  buttonUrl?: string;
  image?: string | null;
  planId?: string | null;
  botToken?: string;
}

export interface Member {
  telegram_user_id: string;
  subscription_status?: string;
  is_active?: boolean;
  telegram_username?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface MembersResult {
  members?: Member[];
  totalCount?: number;
  error?: string;
}

export interface BroadcastResult {
  successCount: number;
  failedCount: number;
}

export interface InlineKeyboard {
  inline_keyboard: Array<Array<{
    text: string;
    url?: string;
    web_app?: { url: string };
    callback_data?: string;
  }>>;
}
