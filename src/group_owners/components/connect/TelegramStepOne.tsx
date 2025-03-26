import React from "react";
import { Bot, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function TelegramStepOne() {
  return (
    <motion.div 
      className="flex flex-col gap-3 md:gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-medium text-xs md:text-sm shadow-sm">
          1
        </div>
        <h3 className="text-base md:text-xl font-semibold text-gray-900 flex items-center gap-1.5 md:gap-2">
          <Bot className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
          Add our bot to your group
        </h3>
      </div>
      <div className="pl-8 md:pl-10">
        <p className="text-sm md:text-base text-gray-600">
          Add <a 
            href="https://t.me/membifybot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium hover:text-indigo-800 underline decoration-2 decoration-indigo-300 underline-offset-2"
          >
            @MembifyBot
          </a> to your Telegram group or channel and make it an administrator with these permissions:
        </p>
        <ul className="mt-2 md:mt-3 space-y-1.5 md:space-y-2">
          <li className="flex items-center text-sm md:text-base text-gray-700">
            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-1.5 md:mr-2 flex-shrink-0" />
            <span>Delete messages</span>
          </li>
          <li className="flex items-center text-sm md:text-base text-gray-700">
            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-1.5 md:mr-2 flex-shrink-0" />
            <span>Ban users</span>
          </li>
          
        </ul>
      </div>
    </motion.div>
  );
}
