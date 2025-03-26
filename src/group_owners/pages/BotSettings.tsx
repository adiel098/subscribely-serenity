
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { BotSettingsLayout } from "@/group_owners/components/bot-settings/BotSettingsLayout";
import { SettingsContent } from "@/group_owners/components/bot-settings/SettingsContent";
import { PageHeader } from "@/components/ui/page-header";
import { Bot } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const BotSettings = () => {
  const { selectedCommunityId, selectedGroupId, isGroupSelected } = useCommunityContext();
  const communityIdToUse = isGroupSelected ? selectedGroupId : selectedCommunityId;
  const isMobile = useIsMobile();
  
  // Add the communityIdToUse as a dependency in the query key to trigger a refetch when it changes
  const { settings, isLoading, updateSettings } = useBotSettings(communityIdToUse);

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
