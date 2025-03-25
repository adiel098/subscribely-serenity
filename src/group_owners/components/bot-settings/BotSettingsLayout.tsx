import { Bot, Sparkles, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";
import { motion } from "framer-motion";
interface BotSettingsLayoutProps {
  isLoading: boolean;
  children: ReactNode;
}
export const BotSettingsLayout = ({
  isLoading,
  children
}: BotSettingsLayoutProps) => {
  if (isLoading) {
    return <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>;
  }
  return <div className="space-y-6 max-w-7xl px-0 py-0 my-[6px]">
      <motion.div className="flex items-center space-x-3" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
          <Bot className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Bot Settings <Sparkles className="h-5 w-5 inline text-amber-400" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Customize your bot's behavior and automated messages for members
          </p>
        </div>
      </motion.div>
      
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.2,
      duration: 0.5
    }}>
        {children}
      </motion.div>
      
      <motion.div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-8" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.4,
      duration: 0.5
    }}>
        <div className="flex items-start space-x-3">
          <div className="bg-indigo-100 p-2 rounded-full">
            <Settings className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-indigo-900">Pro Tip 💡</h3>
            <p className="text-sm text-indigo-700 mt-1">
              Configure your welcome messages, reminders, and broadcasts to increase member retention and engagement rates.
            </p>
          </div>
        </div>
      </motion.div>
    </div>;
};