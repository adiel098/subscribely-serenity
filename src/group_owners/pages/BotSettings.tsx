
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { Bot } from "lucide-react";
import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { WelcomeMessageSection } from "@/group_owners/components/bot-settings/WelcomeMessageSection";
import { SubscriptionSection } from "@/group_owners/components/bot-settings/SubscriptionSection";
import { BroadcastSection } from "@/group_owners/components/bot-settings/BroadcastSection";
import { BotStatsHeader } from "@/group_owners/components/bot-settings/BotStatsHeader";
import { CronJobTimer } from "@/group_owners/components/bot-settings/CronJobTimer";
import { UnifiedMessagePreview } from "@/group_owners/components/bot-settings/UnifiedMessagePreview";

const BotSettings = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { settings, isLoading, updateSettings } = useBotSettings(selectedCommunityId || "");
  const [expandedSection, setExpandedSection] = useState<string | null>("welcome");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No bot settings found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center space-x-2">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Bot Settings</h1>
          <p className="text-sm text-muted-foreground">
            Customize your bot's behavior and automated messages
          </p>
        </div>
      </div>

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
    </div>
  );
};

export default BotSettings;
