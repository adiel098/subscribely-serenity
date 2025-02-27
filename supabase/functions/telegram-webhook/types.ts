
export interface TelegramEvent {
  event_type: string;
  chat_id?: string | number;
  user_id?: string | number;
  username?: string;
  message_id?: number;
  message_text?: string;
  raw_data: any;
  error?: string;
}

export interface ChatMemberUpdate {
  chat: {
    id: number;
  };
  from: {
    id: number;
    username?: string;
  };
  new_chat_member: {
    status: string;
  };
  old_chat_member: {
    status: string;
  };
  invite_link?: {
    invite_link: string;
  };
}

// Define a simplified Database interface with the necessary tables for the handler function
export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string;
          name: string;
          telegram_chat_id: string | null;
          [key: string]: any;
        };
        [key: string]: any;
      };
      telegram_bot_settings: {
        Row: {
          community_id: string;
          welcome_message: string | null;
          welcome_image: string | null;
          bot_signature: string | null;
          [key: string]: any;
        };
        [key: string]: any;
      };
      telegram_chat_members: {
        Row: {
          id: string;
          community_id: string;
          telegram_user_id: string;
          is_active: boolean;
          subscription_status: boolean;
          is_trial: boolean;
          trial_end_date: string | null;
          [key: string]: any;
        };
        [key: string]: any;
      };
      telegram_global_settings: {
        Row: {
          id: string;
          bot_token: string;
          mini_app_url: string | null;
          [key: string]: any;
        };
        [key: string]: any;
      };
      telegram_events: {
        Row: {
          id: string;
          event_type: string;
          chat_id: string | null;
          message_text: string | null;
          username: string | null;
          raw_data: any;
          handled: boolean;
          [key: string]: any;
        };
        Insert: {
          event_type: string;
          chat_id?: string | null;
          message_text?: string | null;
          username?: string | null;
          raw_data: any;
          handled?: boolean;
          [key: string]: any;
        };
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}
