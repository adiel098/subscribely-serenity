
import {
  Bot as GrammyBot,
  Context as GrammyContext,
  webhookCallback as grammyWebhookCallback
} from "https://deno.land/x/grammy@v1.21.1/mod.ts";

export type Bot = GrammyBot;
export type Context = GrammyContext;
export const webhookCallback = grammyWebhookCallback;
