
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessagePreview } from "./MessagePreview";
import { Card, CardContent } from "@/components/ui/card";
import { BotSettings } from "@/group_owners/hooks/useBotSettings"; // Fixed import
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.3 }}
    >
      <Card className="border rounded-lg h-full bg-white shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-3 text-gray-700 flex items-center">
            <MessageCircle className="h-4 w-4 mr-2 text-indigo-500" />
            Message Preview
          </h3>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4 bg-gray-100">
              {Object.entries(tabLabels).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="flex items-center">
                  {tabIcons[key as keyof typeof tabIcons]}
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="welcome" className="mt-0">
              <MessagePreview 
                message={settings.welcome_message} 
                image={settings.welcome_image}
              />
            </TabsContent>
            
            <TabsContent value="first-reminder" className="mt-0">
              <MessagePreview 
                message={settings.first_reminder_message} 
                image={settings.first_reminder_image}
                buttonText="Renew Now"
              />
            </TabsContent>
            
            <TabsContent value="second-reminder" className="mt-0">
              <MessagePreview 
                message={settings.second_reminder_message} 
                image={settings.second_reminder_image}
                buttonText="Renew Now"
              />
            </TabsContent>
            
            <TabsContent value="expired" className="mt-0">
              <MessagePreview 
                message={settings.expired_subscription_message} 
                image={null}
                buttonText="Renew Access"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
