
/**
 * Creates a Telegram invite link
 */
export const createTelegramInviteLink = async (
  botToken: string,
  chatId: string,
  name?: string
): Promise<string> => {
  console.log(`Creating Telegram invite link for chat: ${chatId}`);
  
  try {
    const apiUrl = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;
    
    const params: Record<string, any> = {
      chat_id: chatId
    };
    
    if (name) {
      params.name = name;
    }
    
    console.log("Calling Telegram API to create invite link");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Telegram API error (${response.status}): ${errorText}`);
      throw new Error(`Telegram API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.ok || !result.result || !result.result.invite_link) {
      console.error("Invalid response from Telegram API:", result);
      throw new Error("Invalid response from Telegram API");
    }
    
    console.log(`Successfully created invite link: ${result.result.invite_link}`);
    return result.result.invite_link;
  } catch (error) {
    console.error("Error creating Telegram invite link:", error);
    throw new Error(`Failed to create invite link: ${error instanceof Error ? error.message : String(error)}`);
  }
};
