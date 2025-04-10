
import React from "react";
import { BotSettings } from "@/group_owners/hooks/types/botSettings.types";
import { Card } from "@/components/ui/card";
import { SettingsContent } from "./SettingsContent";
import { Loader2 } from "lucide-react";

interface BotSettingsFormProps {
  settings: BotSettings;
  isLoading: boolean;
  updateSettings: any;
  error: any;
}

export const BotSettingsForm: React.FC<BotSettingsFormProps> = ({
  settings,
  isLoading,
  updateSettings,
  error
}) => {
  if (isLoading) {
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span>Loading settings...</span>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 text-center text-red-600">
        <p>Error loading bot settings: {error instanceof Error ? error.message : String(error)}</p>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card className="p-6 text-center text-amber-600">
        <p>No bot settings found. Settings will be created when you make your first change.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <SettingsContent
        settings={settings}
        updateSettings={updateSettings.mutate}
        entityId={settings.project_id}
        entityType="project"
      />
    </Card>
  );
};
