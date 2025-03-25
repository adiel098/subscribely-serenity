
/**
 * Main entry point for Telegram message sending functionality
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyBotToken } from './telegram/senderCore.ts';
import { sendTextMessage } from './telegram/textMessageSender.ts';
import { sendPhotoMessage } from './telegram/photoMessageSender.ts';

// Re-export the individual functions for direct imports
export { verifyBotToken } from './telegram/senderCore.ts';
export { sendTextMessage } from './telegram/textMessageSender.ts';
export { sendPhotoMessage } from './telegram/photoMessageSender.ts';
