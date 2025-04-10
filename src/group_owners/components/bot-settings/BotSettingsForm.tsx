
import React from "react";
import { BotSettings } from "@/group_owners/hooks/types/subscription.types";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsContent } from "./SettingsContent";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface BotSettingsFormProps {
  settings: BotSettings;
  isLoading: boolean;
  updateSettings: {
    mutate: (settings: Partial<BotSettings>) => void;
    isPending?: boolean;
  };
  error?: Error | null;
}

export const BotSettingsForm: React.FC<BotSettingsFormProps> = ({
  settings,
  isLoading,
  updateSettings,
  error
}) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading bot settings: {error instanceof Error ? error.message : String(error)}
        </AlertDescription>
      </Alert>
    );
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
          entityId={settings.project_id || ''}
          entityType={'project'}
        />
      </CardContent>
    </Card>
  );
};
