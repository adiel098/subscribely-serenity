
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { WelcomeMessageSection } from "./WelcomeMessageSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { SettingsContent } from "./SettingsContent";

interface BotSettingsFormProps {
  settings: BotSettings;
  updateSettings: any;
  isLoading: boolean;
}

export const BotSettingsForm: React.FC<BotSettingsFormProps> = ({
  settings,
  updateSettings,
  isLoading
}) => {
  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0">
        <Tabs defaultValue="welcome" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="welcome">Welcome Message</TabsTrigger>
            <TabsTrigger value="subscription">Subscription Reminders</TabsTrigger>
            <TabsTrigger value="settings">Bot Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="welcome" className="border rounded-md">
            <WelcomeMessageSection 
              settings={settings} 
              updateSettings={updateSettings} 
            />
          </TabsContent>
          
          <TabsContent value="subscription" className="border rounded-md">
            <SubscriptionSection 
              settings={settings} 
              updateSettings={updateSettings} 
            />
          </TabsContent>
          
          <TabsContent value="settings" className="border rounded-md">
            <SettingsContent 
              settings={settings} 
              updateSettings={updateSettings} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
