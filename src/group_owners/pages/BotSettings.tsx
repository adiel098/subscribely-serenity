
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { BotSettingsLayout } from "@/group_owners/components/bot-settings/BotSettingsLayout";
import { SettingsContent } from "@/group_owners/components/bot-settings/SettingsContent";

const BotSettings = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const { settings, isLoading, updateSettings } = useBotSettings(
    isGroupSelected ? null : selectedCommunityId,
    isGroupSelected ? selectedGroupId : null
  );

  return (
    <BotSettingsLayout isLoading={isLoading}>
      <SettingsContent 
        settings={settings} 
        entityId={isGroupSelected ? selectedGroupId : selectedCommunityId} 
        entityType={isGroupSelected ? 'group' : 'community'}
        updateSettings={updateSettings} 
      />
    </BotSettingsLayout>
  );
};

export default BotSettings;
