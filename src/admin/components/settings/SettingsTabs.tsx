
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { GeneralSettings, GeneralFormValues } from "./GeneralSettings";
import { NotificationSettings, NotificationFormValues } from "./NotificationSettings";
import { SecuritySettings } from "./SecuritySettings";
import { BillingSettings } from "./BillingSettings";
import { ApiSettings } from "./ApiSettings";

interface SettingsTabsProps {
  onSaveGeneral: (data: GeneralFormValues) => void;
  onSaveNotifications: (data: NotificationFormValues) => void;
  isSaving: boolean;
}

export function SettingsTabs({ 
  onSaveGeneral, 
  onSaveNotifications, 
  isSaving 
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="bg-background/90 backdrop-blur-sm border">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-6">
        <GeneralSettings onSave={onSaveGeneral} isSaving={isSaving} />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <NotificationSettings onSave={onSaveNotifications} isSaving={isSaving} />
      </TabsContent>
      
      <TabsContent value="security" className="space-y-6">
        <SecuritySettings />
      </TabsContent>
      
      <TabsContent value="billing" className="space-y-6">
        <BillingSettings />
      </TabsContent>
      
      <TabsContent value="api" className="space-y-6">
        <ApiSettings />
      </TabsContent>
    </Tabs>
  );
}
