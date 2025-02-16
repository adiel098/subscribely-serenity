
export async function sendTelegramMessage(botToken: string, chatId: string | number, message: string) {
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
          parse_mode: 'HTML'
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
