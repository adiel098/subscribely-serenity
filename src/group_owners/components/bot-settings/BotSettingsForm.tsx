
import React from "react";
import { BotSettings } from "@/group_owners/hooks/types/subscription.types";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsContent } from "./SettingsContent";

export interface BotSettingsFormProps {
  settings: BotSettings;
  isLoading: boolean;
  updateSettings: {
    mutate: (settings: Partial<BotSettings>) => void;
    isPending?: boolean;
  };
}

export const BotSettingsForm: React.FC<BotSettingsFormProps> = ({
  settings,
  isLoading,
  updateSettings
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleUpdate = (updatedSettings: Partial<BotSettings>) => {
    updateSettings.mutate(updatedSettings);
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <SettingsContent 
          settings={settings} 
          updateSettings={handleUpdate}
          entityId={settings.community_id || settings.project_id || ''}
          entityType={settings.community_id ? 'community' : 'project'}
        />
      </CardContent>
    </Card>
  );
};
