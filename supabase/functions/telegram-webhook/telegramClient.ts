
export async function sendTelegramMessage(
  botToken: string, 
  chatId: string | number, 
  message: string,
  reply_markup?: any
) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
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

export async function sendTelegramPhotoMessage(
  botToken: string,
  chatId: string | number,
  photoUrl: string,
  caption?: string,
  reply_markup?: any
) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: caption,
          parse_mode: 'HTML',
          ...(reply_markup && { reply_markup })
        }),
      }
    );
    const result = await response.json();
    console.log('Photo message sent:', result);
    return result;
  } catch (error) {
    console.error('Error sending photo message:', error);
    throw error;
  }
}
