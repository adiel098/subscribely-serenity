
/**
 * Type definitions for Telegram API objects
 */

export interface RequestBody {
  update_id?: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
  chat_member?: TelegramChatMemberUpdate;
  my_chat_member?: TelegramChatMemberUpdate;
  
  // Additional fields for Mini App integration
  initData?: string;
  start?: string;
  
  // NOWPayments IPN webhook fields
  payment_id?: string;
  payment_status?: string;
  pay_address?: string;
  price_amount?: number;
  price_currency?: string;
  order_id?: string;
  
  // Fields for internal webhook path routing
  path?: string;
  chat_id?: string | number;
  user_id?: string | number;
  reason?: string;
  community_id?: string;
  telegram_user_id?: string;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: TelegramPhotoSize[];
  entities?: MessageEntity[];
  caption?: string;
  caption_entities?: MessageEntity[];
  reply_markup?: InlineKeyboardMarkup;
}

export interface TelegramPhotoSize {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface MessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: TelegramUser;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: {
    url: string;
  };
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  chat_instance?: string;
  data?: string;
}

export interface TelegramChatMemberUpdate {
  chat: TelegramChat;
  from: TelegramUser;
  date: number;
  old_chat_member?: TelegramChatMember;
  new_chat_member: TelegramChatMember;
}

export interface TelegramChatMember {
  user: TelegramUser;
  status: string;
  until_date?: number;
}

export interface TelegramWebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}
