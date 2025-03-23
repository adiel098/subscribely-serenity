
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

export const UnifiedMessagePreview = ({ settings, activeSection }: UnifiedMessagePreviewProps) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border rounded-lg h-full bg-white shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-base font-medium text-indigo-800 mb-3 flex items-center">
            <span className="bg-indigo-100 p-1 rounded-md mr-2">
              <MessageCircle className="h-4 w-4 text-indigo-600" />
            </span>
            Message Preview
          </h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4 bg-gray-100 p-1">
              {Object.entries(tabLabels).map(([key, label]) => (
                <TabsTrigger 
                  key={key}
                  value={key} 
                  className="flex-1 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm flex items-center justify-center"
                >
                  {tabIcons[key]} {label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="welcome" className="mt-2">
              <MessagePreview
                message={settings.welcome_message}
                signature={settings.bot_signature}
                image={settings.welcome_image}
              />
            </TabsContent>
            
            <TabsContent value="first-reminder" className="mt-2">
              <MessagePreview
                message={settings.first_reminder_message || "Your subscription will expire soon. Renew now to maintain access!"}
                signature={settings.bot_signature}
                image={settings.first_reminder_image}
                buttonText="Renew Now! 🔄"
              />
            </TabsContent>
            
            <TabsContent value="second-reminder" className="mt-2">
              <MessagePreview
                message={settings.second_reminder_message || "Final reminder: Your subscription expires tomorrow. Renew now to avoid losing access!"}
                signature={settings.bot_signature}
                image={settings.second_reminder_image}
                buttonText="Renew Now! ⚡"
              />
            </TabsContent>
            
            <TabsContent value="expired" className="mt-2">
              <MessagePreview
                message={settings.expired_subscription_message || "Your subscription has expired. Please renew to regain access."}
                signature={settings.bot_signature}
                buttonText="Renew Access 🔑"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
