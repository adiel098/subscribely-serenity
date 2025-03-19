
import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function TelegramConnectHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8"
    >
      <div className="flex justify-center mb-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-white" />
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Connect Telegram Community 🚀
      </h1>
      <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
        Follow these simple steps to connect your Telegram community to our platform and start managing your members effortlessly ✨
      </p>
    </motion.div>
  );
}
