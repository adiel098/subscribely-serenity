
import React from "react";
import { Bot, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function TelegramStepOne() {
  return (
    <motion.div 
      className="flex flex-col md:flex-row gap-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex-shrink-0 flex items-start">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
          1
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600" />
          Add our bot to your group
        </h3>
        <p className="mt-2 text-gray-600">
          Add <a 
            href="https://t.me/membifybot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium hover:text-indigo-800 underline decoration-2 decoration-indigo-300 underline-offset-2"
          >
            @MembifyBot
          </a> to your Telegram group or channel and make it an administrator with these permissions:
        </p>
        <ul className="mt-3 space-y-2">
          <li className="flex items-center text-gray-700">
            <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Delete messages</span>
          </li>
          <li className="flex items-center text-gray-700">
            <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Ban users</span>
          </li>
          <li className="flex items-center text-gray-700">
            <ShieldCheck className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>Add new admins</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
