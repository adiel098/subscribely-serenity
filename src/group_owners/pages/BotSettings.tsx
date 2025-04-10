import { useEffect } from "react";
import { useBotSettings, BotSettings as BotSettingsType } from "@/group_owners/hooks/useBotSettings";
import { useProjectContext } from "@/contexts/ProjectContext";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import { BotSettingsForm } from "@/group_owners/components/bot-settings/BotSettingsForm";

interface ExtendedBotSettings extends BotSettingsType {
  project_id?: string;
  use_custom_bot?: boolean;
  custom_bot_token?: string | null;
}

const BotSettings = () => {
  const { selectedProjectId } = useProjectContext();
  const { 
    settings,
    isLoading,
    updateSettings,
    error
  } = useBotSettings(selectedProjectId || undefined);

  useEffect(() => {
    // Component-specific logic can be added here
  }, [selectedProjectId]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <PageHeader 
          title="Bot Settings" 
          description="Configure your Telegram bot behavior"
          icon={<Bot className="h-6 w-6" />} 
        />
        <Card className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span>Loading bot settings...</span>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <PageHeader 
          title="Bot Settings" 
          description="Configure your Telegram bot behavior"
          icon={<Bot className="h-6 w-6" />} 
        />
        <Card className="p-8 text-center text-red-600">
          Error loading bot settings: {error instanceof Error ? error.message : String(error)}
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <PageHeader 
        title="Bot Settings" 
        description="Configure your Telegram bot behavior"
        icon={<Bot className="h-6 w-6" />} 
      />

      <BotSettingsForm 
        settings={settings as ExtendedBotSettings} 
        isLoading={isLoading} 
        updateSettings={updateSettings}
        error={error} 
      />
    </div>
  );
};

export default BotSettings;
