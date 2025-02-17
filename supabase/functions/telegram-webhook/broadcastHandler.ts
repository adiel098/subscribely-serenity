
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface BroadcastStatus {
  successCount: number;
  failureCount: number;
  totalRecipients: number;
}

interface Recipient {
  userId: string;
  username: string | null;
}

export async function sendBroadcastMessage(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  message: string,
  filterType: 'all' | 'active' | 'expired' | 'plan' = 'all',
  subscriptionPlanId?: string,
  includeButton?: boolean,
  recipients?: Recipient[]
): Promise<BroadcastStatus> {
  try {
    console.log('Starting broadcast to recipients:', recipients);

    // Get bot token
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error('Error fetching bot token:', settingsError);
      throw new Error('Bot token not found');
    }

    let successCount = 0;
    let failureCount = 0;

    // אם אין רשימת נמענים, נחזיר שגיאה
    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients provided for broadcast');
    }

    const BOT_TOKEN = settings.bot_token;

    // שליחת הודעות בצורה סדרתית
    for (const recipient of recipients) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: recipient.userId,
            text: message,
            parse_mode: 'HTML'
          }),
        });

        const result = await response.json();
        console.log(`Message sent to ${recipient.username || recipient.userId}:`, result);

        if (result.ok) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send message to ${recipient.username || recipient.userId}:`, result);
        }

        // להוסיף השהייה קטנה בין הודעות כדי להימנע מחסימה
        await new Promise(resolve => setTimeout(resolve, 35));
      } catch (error) {
        console.error(`Error sending message to ${recipient.username || recipient.userId}:`, error);
        failureCount++;
      }
    }

    const status: BroadcastStatus = {
      successCount,
      failureCount,
      totalRecipients: recipients.length
    };

    console.log('Broadcast completed with status:', status);
    return status;

  } catch (error) {
    console.error('Error in broadcast handler:', error);
    throw error;
  }
}
