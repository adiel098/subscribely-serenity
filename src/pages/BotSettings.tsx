
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/hooks/useBotSettings";
import { Bot } from "lucide-react";
import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { MessagePreview } from "@/components/bot-settings/MessagePreview";
import { WelcomeMessageSection } from "@/components/bot-settings/WelcomeMessageSection";
import { SubscriptionSection } from "@/components/bot-settings/SubscriptionSection";
import { BroadcastSection } from "@/components/bot-settings/BroadcastSection";

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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center space-x-2">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Bot Settings</h1>
          <p className="text-sm text-muted-foreground">
            Customize your bot's behavior and automated messages
          </p>
        </div>
      </div>

      <MessagePreview 
        message={expandedSection === "welcome" ? settings.welcome_message : settings.subscription_reminder_message}
        signature={settings.bot_signature}
      />

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
  );
};

export default BotSettings;
