
/**
 * Creates an invite link via Telegram API
 */
export const createTelegramInviteLink = async (botToken: string, chatId: string, name: string) => {
  const createInviteLinkUrl = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;
  
  const response = await fetch(createInviteLinkUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      name: name
    })
  });
  
  const result = await response.json();
  
  if (!result.ok) {
    console.error("Telegram API error:", result);
    throw new Error("Failed to create invite link via Telegram API");
  }
  
  return result.result.invite_link;
};
