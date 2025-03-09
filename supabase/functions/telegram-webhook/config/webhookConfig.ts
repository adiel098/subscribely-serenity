
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface WebhookConfig {
  supabaseClient: ReturnType<typeof createClient>;
  botToken: string;
}

export async function setupWebhookConfig(): Promise<WebhookConfig> {
  console.log("[CONFIG] 🔌 Setting up webhook configuration");
  
  // Create Supabase client
  console.log("[CONFIG] 🔌 Creating Supabase client");
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[CONFIG] ❌ Missing Supabase credentials:", { 
      urlExists: !!supabaseUrl, 
      keyExists: !!supabaseServiceKey 
    });
    throw new Error('Missing Supabase credentials');
  }
  
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  console.log("[CONFIG] ✅ Supabase client created successfully");

  // Get bot token from settings
  console.log("[CONFIG] 🔑 Fetching bot token");
  const { data: settings, error: settingsError } = await supabaseClient
    .from('telegram_global_settings')
    .select('bot_token')
    .single();

  if (settingsError || !settings?.bot_token) {
    console.error("[CONFIG] ❌ Error fetching bot token:", settingsError);
    throw new Error('Bot token not found in settings');
  }

  const botToken = settings.bot_token;
  console.log("[CONFIG] ✅ Bot token retrieved successfully");
  
  return {
    supabaseClient,
    botToken
  };
}
