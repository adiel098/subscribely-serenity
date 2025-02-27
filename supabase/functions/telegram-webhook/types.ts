
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
