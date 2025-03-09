
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { sendFirstReminder } from "./firstReminderSender.ts";
import { sendSecondReminder } from "./secondReminderSender.ts";
import { sendLegacyReminder } from "./legacyReminderSender.ts";
import { logSuccessfulNotification } from "./notificationLogger.ts";

// Re-export functions for backwards compatibility
export { sendFirstReminder } from "./firstReminderSender.ts";
export { sendSecondReminder } from "./secondReminderSender.ts";
export { sendLegacyReminder } from "./legacyReminderSender.ts";
export { logSuccessfulNotification } from "./notificationLogger.ts";

/**
 * Main module for handling all reminder services
 * This file is kept for backwards compatibility but delegates to specialized modules
 */
