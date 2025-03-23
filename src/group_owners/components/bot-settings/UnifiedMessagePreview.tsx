import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessagePreview } from "./MessagePreview";
import { Card, CardContent } from "@/components/ui/card";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { motion } from "framer-motion";
import { MessageCircle, Bell, AlertTriangle, CheckCheck } from "lucide-react";
interface UnifiedMessagePreviewProps {
  settings: BotSettings;
  activeSection: string | null;
}
export const UnifiedMessagePreview = ({
  settings,
  activeSection
}: UnifiedMessagePreviewProps) => {
  const [activeTab, setActiveTab] = useState("welcome");

  // When the accordion section changes, update the active tab
  useEffect(() => {
    if (activeSection === "welcome") {
      setActiveTab("welcome");
    } else if (activeSection === "subscription") {
      setActiveTab("first-reminder");
    }
  }, [activeSection]);
  const tabIcons = {
    "welcome": <MessageCircle className="h-3.5 w-3.5 mr-1.5" />,
    "first-reminder": <Bell className="h-3.5 w-3.5 mr-1.5" />,
    "second-reminder": <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />,
    "expired": <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
  };
  const tabLabels = {
    "welcome": "Welcome",
    "first-reminder": "First Reminder",
    "second-reminder": "Final Reminder",
    "expired": "Expired"
  };
  return <motion.div initial={{
    opacity: 0,
    scale: 0.98
  }} animate={{
    opacity: 1,
    scale: 1
  }} transition={{
    duration: 0.3
  }}>
      <Card className="border rounded-lg h-full bg-white shadow-sm">
        
      </Card>
    </motion.div>;
};