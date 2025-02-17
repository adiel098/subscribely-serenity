
export class TelegramClient {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async sendMessage(chatId: string | number, message: string, reply_markup?: any) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            ...(reply_markup && { reply_markup })
          }),
        }
      );
      const result = await response.json();
      console.log('Message sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async kickChatMember(chatId: string | number, userId: string | number) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/banChatMember`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: userId
          }),
        }
      );
      const result = await response.json();
      console.log('Member kicked:', result);
      return result;
    } catch (error) {
      console.error('Error kicking member:', error);
      throw error;
    }
  }

  async createChatInviteLink(chatId: string | number, name?: string, expireDate?: number, memberLimit?: number) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/createChatInviteLink`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            ...(name && { name }),
            ...(expireDate && { expire_date: expireDate }),
            ...(memberLimit && { member_limit: memberLimit })
          }),
        }
      );
      const result = await response.json();
      console.log('Invite link created:', result);
      return result;
    } catch (error) {
      console.error('Error creating invite link:', error);
      throw error;
    }
  }
}
