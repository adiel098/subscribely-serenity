
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
import { PlanSettings } from "./PlanSettings";

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
      <TabsList className="bg-white/90 backdrop-blur-sm border border-indigo-100 rounded-xl shadow-sm">
        <TabsTrigger 
          value="general" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
        >
          General
        </TabsTrigger>
        <TabsTrigger 
          value="notifications" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
        >
          Notifications
        </TabsTrigger>
        <TabsTrigger 
          value="plans" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
        >
          Plans
        </TabsTrigger>
        <TabsTrigger 
          value="security" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
        >
          Security
        </TabsTrigger>
        <TabsTrigger 
          value="billing" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
        >
          Billing
        </TabsTrigger>
        <TabsTrigger 
          value="api" 
          className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700"
        >
          API
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-6">
        <GeneralSettings onSave={onSaveGeneral} isSaving={isSaving} />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <NotificationSettings onSave={onSaveNotifications} isSaving={isSaving} />
      </TabsContent>
      
      <TabsContent value="plans" className="space-y-6">
        <PlanSettings />
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
