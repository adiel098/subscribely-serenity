
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { BotSettingsLayout } from "@/group_owners/components/bot-settings/BotSettingsLayout";
import { SettingsContent } from "@/group_owners/components/bot-settings/SettingsContent";

const BotSettings = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { settings, isLoading, updateSettings } = useBotSettings(selectedCommunityId || "");

  return (
    <BotSettingsLayout isLoading={isLoading}>
      <SettingsContent 
        settings={settings} 
        selectedCommunityId={selectedCommunityId} 
        updateSettings={updateSettings} 
      />
    </BotSettingsLayout>
  );
};

export default BotSettings;
