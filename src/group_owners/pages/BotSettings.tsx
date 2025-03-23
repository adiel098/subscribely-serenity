
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { BotSettingsLayout } from "@/group_owners/components/bot-settings/BotSettingsLayout";
import { SettingsContent } from "@/group_owners/components/bot-settings/SettingsContent";
import { PageHeader } from "@/components/ui/page-header";
import { Bot } from "lucide-react";

const BotSettings = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const communityIdToUse = isGroupSelected ? selectedGroupId : selectedCommunityId;
  
  const { settings, isLoading, updateSettings } = useBotSettings(communityIdToUse);

  return (
    <div className="container px-4 py-6 max-w-7xl mx-auto">
      <PageHeader
        title="Bot Management"
        description="Configure your bot's automated messages and behavior settings"
        icon={<Bot className="h-6 w-6 text-indigo-600" />}
        className="mb-8"
      />
      
      <BotSettingsLayout isLoading={isLoading}>
        <SettingsContent 
          settings={settings} 
          entityId={communityIdToUse} 
          entityType={isGroupSelected ? 'group' : 'community'}
          updateSettings={updateSettings} 
        />
      </BotSettingsLayout>
    </div>
  );
};

export default BotSettings;
