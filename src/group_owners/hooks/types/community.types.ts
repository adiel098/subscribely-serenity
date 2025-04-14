/**
 * Type definitions for legacy community objects
 * @deprecated Communities are being phased out in favor of Projects
 */

export interface Community {
  id: string;
  name: string;
  description?: string;
  telegram_chat_id?: string;
  telegram_photo_url?: string;
  custom_link?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  subscription_count?: number;
  is_group?: boolean;
  project_id?: string | null;
}
