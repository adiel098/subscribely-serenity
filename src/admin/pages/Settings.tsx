
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useState } from "react";
import { SettingsTabs } from "@/admin/components/settings/SettingsTabs";
import { GeneralFormValues } from "@/admin/components/settings/GeneralSettings";
import { NotificationFormValues } from "@/admin/components/settings/NotificationSettings";

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const onSaveGeneral = (data: GeneralFormValues) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("General settings saved:", data);
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const onSaveNotifications = (data: NotificationFormValues) => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Notification settings saved:", data);
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">
          Configure and customize the platform ⚙️
        </p>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your settings have been saved successfully.
          </AlertDescription>
        </Alert>
      )}

      <SettingsTabs 
        onSaveGeneral={onSaveGeneral} 
        onSaveNotifications={onSaveNotifications} 
        isSaving={isSaving} 
      />
    </div>
  );
}
