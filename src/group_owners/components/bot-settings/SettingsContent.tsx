
import React from "react";
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { WelcomeMessageSection } from "./WelcomeMessageSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface SettingsContentProps {
  settings: BotSettings;
  updateSettings: (settings: Partial<BotSettings>) => void;
  entityId: string;
  entityType: 'community' | 'project';
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  settings,
  updateSettings,
  entityId,
  entityType
}) => {
  return (
    <Tabs defaultValue="welcome" className="w-full">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="welcome">Welcome Message</TabsTrigger>
        <TabsTrigger value="subscription">Subscription Notifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="welcome" className="pt-6">
        <WelcomeMessageSection 
          settings={settings}
          updateSettings={updateSettings}
        />
      </TabsContent>
      
      <TabsContent value="subscription" className="pt-6">
        <SubscriptionSection 
          settings={settings}
          updateSettings={updateSettings}
        />
      </TabsContent>
    </Tabs>
  );
};
