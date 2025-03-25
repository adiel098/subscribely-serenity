
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState, useEffect } from "react";
import { BotStatsHeader } from "./BotStatsHeader";
import { WelcomeMessageSection } from "./WelcomeMessageSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { BroadcastSection } from "./BroadcastSection";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, MessageSquare, BellRing, Megaphone, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SettingsContentProps {
  settings: BotSettings | null;
  entityId: string | null;
  entityType: 'community' | 'group';
  updateSettings: any;
  isMobile?: boolean;
}

export const SettingsContent = ({
  settings,
  entityId,
  entityType,
  updateSettings,
  isMobile = false
}: SettingsContentProps) => {
  const [activeSection, setActiveSection] = useState<string | null>("welcome");
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  // Reset the openCollapsible state to null (all closed) on mobile
  useEffect(() => {
    if (isMobile) {
      setOpenCollapsible(null);
    }
  }, [isMobile]);

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

  if (isMobile) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        <motion.div variants={itemVariants}>
          <BotStatsHeader entityId={entityId || ""} entityType={entityType} />
        </motion.div>

        <div className="space-y-4">
          {sectionData.map(({ key, title, description, icon, color, borderColor, Component }) => (
            <Collapsible
              key={key}
              open={openCollapsible === key}
              onOpenChange={(open) => setOpenCollapsible(open ? key : null)}
              className={`border ${borderColor} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bot-settings-collapsible`}
            >
              <CollapsibleTrigger className={`w-full bg-gradient-to-r ${color} p-3 flex items-center justify-between cursor-pointer bot-settings-trigger`}>
                <div className="flex items-center gap-2">
                  <div className="bg-white/60 p-1.5 rounded-full">{icon}</div>
                  <div className="text-left">
                    <h3 className="font-medium text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openCollapsible === key ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 bg-white">
                  <Component 
                    settings={settings} 
                    updateSettings={updateSettings}
                    entityId={entityId || ""}
                    entityType={entityType}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </motion.div>
    );
  }

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
    </motion.div>
  );
};
