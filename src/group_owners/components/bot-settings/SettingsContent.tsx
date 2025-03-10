
import { BotSettings } from "@/group_owners/hooks/useBotSettings";
import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { CronJobTimer } from "./CronJobTimer";
import { BotStatsHeader } from "./BotStatsHeader";
import { WelcomeMessageSection } from "./WelcomeMessageSection";
import { SubscriptionSection } from "./SubscriptionSection";
import { BroadcastSection } from "./BroadcastSection";
import { UnifiedMessagePreview } from "./UnifiedMessagePreview";

interface SettingsContentProps {
  settings: BotSettings | null;
  selectedCommunityId: string | null;
  updateSettings: any;
}

export const SettingsContent = ({ 
  settings, 
  selectedCommunityId, 
  updateSettings 
}: SettingsContentProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("welcome");

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No bot settings found</p>
      </div>
    );
  }

  return (
    <>
      <CronJobTimer />

      <BotStatsHeader communityId={selectedCommunityId || ""} />

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Accordion
            type="single"
            collapsible
            value={expandedSection || undefined}
            onValueChange={(value) => setExpandedSection(value)}
            className="space-y-4"
          >
            <WelcomeMessageSection settings={settings} updateSettings={updateSettings} />
            <SubscriptionSection settings={settings} updateSettings={updateSettings} />
            <BroadcastSection communityId={selectedCommunityId || ""} />
          </Accordion>
        </div>
        
        <div className="md:col-span-2 sticky top-6">
          <UnifiedMessagePreview settings={settings} activeSection={expandedSection} />
        </div>
      </div>
    </>
  );
};
