
export interface Project {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  bot_token?: string | null;
  created_at: string;
  updated_at: string;
}
