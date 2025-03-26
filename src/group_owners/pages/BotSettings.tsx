
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { BotSettingsLayout } from "@/group_owners/components/bot-settings/BotSettingsLayout";
import { SettingsContent } from "@/group_owners/components/bot-settings/SettingsContent";
import { PageHeader } from "@/components/ui/page-header";
import { Bot } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

const BotSettings = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const communityIdToUse = isGroupSelected ? selectedGroupId : selectedCommunityId;
  const isMobile = useIsMobile();
  
  // Ensure we pass the correct communityId to the useBotSettings hook
  const { settings, isLoading, updateSettings } = useBotSettings(communityIdToUse);

  console.log('BotSettings component - Selected community/group ID:', communityIdToUse);
  console.log('BotSettings component - Fetched settings:', settings);

  // Use useEffect to monitor key changes for debugging
  useEffect(() => {
    console.log('BotSettings: communityIdToUse changed to:', communityIdToUse);
  }, [communityIdToUse]);

  useEffect(() => {
    if (settings) {
      console.log('BotSettings: settings loaded:', {
        id: settings.id,
        community_id: settings.community_id,
        welcome_message: settings.welcome_message
      });
    }
  }, [settings]);

  return (
    <div className={`${isMobile ? 'p-3' : 'p-6'} w-full`}>
      <BotSettingsLayout isLoading={isLoading}>
        <SettingsContent 
          settings={settings} 
          entityId={communityIdToUse} 
          entityType={isGroupSelected ? 'group' : 'community'}
          updateSettings={updateSettings}
          isMobile={isMobile}
        />
      </BotSettingsLayout>
    </div>
  );
};

export default BotSettings;
