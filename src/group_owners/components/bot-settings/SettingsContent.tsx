
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { BotStatsHeader } from "./BotStatsHeader";
import { WelcomeMessageSection } from "./WelcomeMessageSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { BroadcastSection } from "./BroadcastSection";
import { UnifiedMessagePreview } from "./UnifiedMessagePreview";
import { motion } from "framer-motion";
import { Bot, MessageSquare, BellRing, Megaphone } from "lucide-react";

interface SettingsContentProps {
  settings: BotSettings | null;
  entityId: string | null;
  entityType: 'community' | 'group';
  updateSettings: any;
}

export const SettingsContent = ({ 
  settings, 
  entityId, 
  entityType,
  updateSettings 
}: SettingsContentProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("welcome");

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No bot settings found</p>
          <p className="text-sm text-muted-foreground mt-1">Connect your Telegram bot to manage settings</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <BotStatsHeader entityId={entityId || ""} entityType={entityType} />
      </motion.div>

      <div className="grid md:grid-cols-5 gap-6">
        <motion.div className="md:col-span-3" variants={itemVariants}>
          <Accordion
            type="single"
            collapsible
            value={expandedSection || undefined}
            onValueChange={(value) => setExpandedSection(value)}
            className="space-y-4"
          >
            <WelcomeMessageSection settings={settings} updateSettings={updateSettings} />
            <SubscriptionSection settings={settings} updateSettings={updateSettings} />
            <BroadcastSection 
              entityId={entityId || ""} 
              entityType={entityType}
            />
          </Accordion>
        </motion.div>
        
        <motion.div className="md:col-span-2 sticky top-6" variants={itemVariants}>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-lg mb-3">
            <p className="text-sm font-medium text-indigo-800 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" /> 
              Preview your messages exactly as users will see them 👀
            </p>
          </div>
          <UnifiedMessagePreview settings={settings} activeSection={expandedSection} />
        </motion.div>
      </div>
    </motion.div>
  );
};
