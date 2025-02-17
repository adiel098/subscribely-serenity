import { TelegramClient } from "./telegramClient.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export class WebhookManager {
  private update: any;
  private telegramClient: TelegramClient;
  private supabaseClient: ReturnType<typeof createClient>;

  constructor(
    update: any,
    telegramClient: TelegramClient,
    supabaseClient: ReturnType<typeof createClient>
  ) {
    this.update = update;
    this.telegramClient = telegramClient;
    this.supabaseClient = supabaseClient;
  }

}
