
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState } from "react";
import { BotStatsHeader } from "./BotStatsHeader";
import { WelcomeMessageSection } from "./WelcomeMessageSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { BroadcastSection } from "./BroadcastSection";
import { UnifiedMessagePreview } from "./UnifiedMessagePreview";
import { motion } from "framer-motion";
import { Bot, MessageSquare, BellRing, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const [activeSection, setActiveSection] = useState<string | null>("welcome");

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
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const sectionData = [
    {
      key: "welcome",
      title: "Welcome Message",
      description: "First greeting for new members",
      icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
      color: "from-indigo-50 to-blue-50",
      borderColor: "border-indigo-100",
      Component: WelcomeMessageSection
    },
    {
      key: "subscription",
      title: "Subscription Reminders",
      description: "Renewal notifications for members",
      icon: <BellRing className="h-5 w-5 text-amber-500" />,
      color: "from-amber-50 to-yellow-50",
      borderColor: "border-amber-100",
      Component: SubscriptionSection
    },
    {
      key: "broadcast",
      title: "Broadcast Messages",
      description: "Send announcements to members",
      icon: <Megaphone className="h-5 w-5 text-red-500" />,
      color: "from-red-50 to-amber-50",
      borderColor: "border-red-100",
      Component: BroadcastSection
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants}>
        <BotStatsHeader entityId={entityId || ""} entityType={entityType} />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
          {sectionData.map(({ key, title, description, icon, color, borderColor, Component }) => (
            <Card 
              key={key} 
              className={`overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border ${borderColor}`}
              onClick={() => setActiveSection(key)}
            >
              <div className={`bg-gradient-to-r ${color} p-4 flex items-center gap-3 border-b ${borderColor}`}>
                <div className="bg-white/60 p-2 rounded-full">{icon}</div>
                <div>
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <CardContent className="p-0">
                <Component 
                  settings={settings} 
                  updateSettings={updateSettings}
                  entityId={entityId || ""}
                  entityType={entityType}
                />
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <UnifiedMessagePreview settings={settings} activeSection={activeSection} />
      </motion.div>
    </motion.div>
  );
};
