
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { BotSettingsLayout } from "@/group_owners/components/bot-settings/BotSettingsLayout";
import { SettingsContent } from "@/group_owners/components/bot-settings/SettingsContent";

const BotSettings = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const communityIdToUse = isGroupSelected ? selectedGroupId : selectedCommunityId;
  
  const { settings, isLoading, updateSettings } = useBotSettings(communityIdToUse);

  return (
    <BotSettingsLayout isLoading={isLoading}>
      <SettingsContent 
        settings={settings} 
        entityId={communityIdToUse} 
        entityType={isGroupSelected ? 'group' : 'community'}
        updateSettings={updateSettings} 
      />
    </BotSettingsLayout>
  );
};

export default BotSettings;
