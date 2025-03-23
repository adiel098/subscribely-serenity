
import React from "react";
import { TelegramChat, TelegramChatItem } from "./TelegramChatItem";
import { motion } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle } from "lucide-react";

interface TelegramChatsListProps {
  chats: TelegramChat[];
}

export const TelegramChatsList: React.FC<TelegramChatsListProps> = ({ chats }) => {
  if (!chats || chats.length === 0) {
    return (
      <Alert className="mt-4 bg-amber-50 border-amber-100">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">No Groups Found</AlertTitle>
        <AlertDescription className="text-amber-700">
          Your bot token is valid, but the bot isn't added to any groups or channels yet. 
          Make sure to add your bot to your Telegram groups and grant it admin privileges.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4"
    >
      <div className="p-4 bg-white border border-green-100 rounded-lg shadow-sm">
        <div className="flex items-center gap-1.5 mb-3">
          <Shield className="h-4 w-4 text-green-600" />
          <h4 className="font-medium text-green-700">
            Bot Connected Successfully
          </h4>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">
          Your bot is connected to {chats.length} {chats.length === 1 ? 'chat' : 'chats'}:
        </p>
        
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          {chats.map((chat, index) => (
            <TelegramChatItem key={index} chat={chat} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
