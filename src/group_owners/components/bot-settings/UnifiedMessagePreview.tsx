
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessagePreview } from "./MessagePreview";
import { Card, CardContent } from "@/components/ui/card";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";

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

  return (
    <Card className="border rounded-lg h-full">
      <CardContent className="p-4">
        <h3 className="text-base font-medium mb-3">Message Preview</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="welcome" className="flex-1">Welcome</TabsTrigger>
            <TabsTrigger value="first-reminder" className="flex-1">First Reminder</TabsTrigger>
            <TabsTrigger value="second-reminder" className="flex-1">Final Reminder</TabsTrigger>
            <TabsTrigger value="expired" className="flex-1">Expired</TabsTrigger>
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
              buttonText="Renew Now!"
            />
          </TabsContent>
          
          <TabsContent value="second-reminder" className="mt-2">
            <MessagePreview
              message={settings.second_reminder_message || "Final reminder: Your subscription expires tomorrow. Renew now to avoid losing access!"}
              signature={settings.bot_signature}
              image={settings.second_reminder_image}
              buttonText="Renew Now!"
            />
          </TabsContent>
          
          <TabsContent value="expired" className="mt-2">
            <MessagePreview
              message={settings.expired_subscription_message || "Your subscription has expired. Please renew to regain access."}
              signature={settings.bot_signature}
              buttonText="Renew Now!"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
