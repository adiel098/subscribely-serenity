export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  bot_token: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive';
  settings?: ProjectSettings;
}

export interface ProjectSettings {
  welcome_message?: string;
  payment_methods?: string[];
  notification_settings?: {
    renewal_reminder_days: number[];
    expiration_reminder_days: number[];
  };
  custom_branding?: {
    logo_url?: string;
    primary_color?: string;
    secondary_color?: string;
  };
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  bot_token: string;
  settings?: ProjectSettings;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  bot_token?: string;
  status?: 'active' | 'inactive';
  settings?: ProjectSettings;
}
