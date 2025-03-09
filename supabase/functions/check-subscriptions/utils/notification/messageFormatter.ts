
import { BotSettings } from "../types.ts";

/**
 * Format a first reminder message with the appropriate content
 */
export function formatFirstReminderMessage(botSettings: BotSettings): string {
  return botSettings.first_reminder_message + 
    (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');
}

/**
 * Format a second reminder message with the appropriate content
 */
export function formatSecondReminderMessage(botSettings: BotSettings): string {
  return botSettings.second_reminder_message + 
    (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');
}

/**
 * Format a legacy reminder message with the appropriate content
 */
export function formatLegacyReminderMessage(botSettings: BotSettings): string {
  return botSettings.subscription_reminder_message + 
    (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');
}
