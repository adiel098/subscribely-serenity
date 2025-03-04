
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Bell, Save } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  paymentAlerts: z.boolean(),
  newUserSignups: z.boolean(),
  newCommunities: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
});

export type NotificationFormValues = z.infer<typeof notificationFormSchema>;

interface NotificationSettingsProps {
  onSave: (data: NotificationFormValues) => void;
  isSaving: boolean;
}

export function NotificationSettings({ onSave, isSaving }: NotificationSettingsProps) {
  // Notification Settings Form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      paymentAlerts: true,
      newUserSignups: true,
      newCommunities: true,
      securityAlerts: true,
      marketingEmails: false,
    },
  });

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how you receive platform notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...notificationForm}>
          <form onSubmit={notificationForm.handleSubmit(onSave)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={notificationForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive platform notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="paymentAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <FormLabel className="text-base">Payment Alerts</FormLabel>
                      <FormDescription>
                        Get notified about payment activities
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="newUserSignups"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <FormLabel className="text-base">New User Signups</FormLabel>
                      <FormDescription>
                        Get notified when new users register
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="newCommunities"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <FormLabel className="text-base">New Communities</FormLabel>
                      <FormDescription>
                        Get notified when new communities are created
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="securityAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <FormLabel className="text-base">Security Alerts</FormLabel>
                      <FormDescription>
                        Get notified about security events
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationForm.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <FormLabel className="text-base">Marketing Emails</FormLabel>
                      <FormDescription>
                        Receive marketing and promotional emails
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
              disabled={isSaving}
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
