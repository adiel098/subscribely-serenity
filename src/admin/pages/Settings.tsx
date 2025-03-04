
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Globe,
  CreditCard,
  FileText,
  Mail,
  AlertTriangle,
  Info
} from "lucide-react";
import { useState } from "react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const generalFormSchema = z.object({
  siteName: z.string().min(2, { message: "Site name must be at least 2 characters" }),
  siteUrl: z.string().url({ message: "Please enter a valid URL" }),
  adminEmail: z.string().email({ message: "Please enter a valid email" }),
  supportEmail: z.string().email({ message: "Please enter a valid email" }),
  defaultLanguage: z.string(),
  maintenance: z.boolean(),
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  paymentAlerts: z.boolean(),
  newUserSignups: z.boolean(),
  newCommunities: z.boolean(),
  securityAlerts: z.boolean(),
  marketingEmails: z.boolean(),
});

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General Settings Form
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      siteName: "Membify",
      siteUrl: "https://membify.app",
      adminEmail: "admin@membify.app",
      supportEmail: "support@membify.app",
      defaultLanguage: "en",
      maintenance: false,
    },
  });

  // Notification Settings Form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
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

  const onSubmitGeneral = (data: z.infer<typeof generalFormSchema>) => {
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

  const onSubmitNotifications = (data: z.infer<typeof notificationFormSchema>) => {
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-background/90 backdrop-blur-sm border">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-indigo-600" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure the basic platform settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Membify" {...field} className="border-indigo-100" />
                          </FormControl>
                          <FormDescription>
                            The name of your application
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="siteUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://membify.app" {...field} className="border-indigo-100" />
                          </FormControl>
                          <FormDescription>
                            The URL of your application
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@membify.app" {...field} className="border-indigo-100" />
                          </FormControl>
                          <FormDescription>
                            Primary admin contact email
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input placeholder="support@membify.app" {...field} className="border-indigo-100" />
                          </FormControl>
                          <FormDescription>
                            Customer support email address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                      control={generalForm.control}
                      name="defaultLanguage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Language</FormLabel>
                          <FormControl>
                            <Input placeholder="en" {...field} className="border-indigo-100" />
                          </FormControl>
                          <FormDescription>
                            Default language code (e.g., en, fr, es)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="maintenance"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <div>
                              <FormLabel>Maintenance Mode</FormLabel>
                              <FormDescription>
                                Enable maintenance mode for the platform
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
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
          
          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-orange-700/70">
                These actions are destructive and cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-orange-100 pb-4">
                  <div>
                    <h4 className="font-medium">Reset Platform Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Clear all platform data except admin accounts
                    </p>
                  </div>
                  <Button variant="destructive">Reset Data</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Factory Reset</h4>
                    <p className="text-sm text-muted-foreground">
                      Delete all data and reset to factory defaults
                    </p>
                  </div>
                  <Button variant="destructive">Factory Reset</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
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
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
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
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure platform security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Require two-factor authentication for admin accounts
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">Password Policies</h4>
                      <p className="text-sm text-muted-foreground">
                        Enforce strong password requirements
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out inactive sessions
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">IP Restrictions</h4>
                      <p className="text-sm text-muted-foreground">
                        Restrict admin access to specific IP addresses
                      </p>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                </div>
                
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Billing Settings
              </CardTitle>
              <CardDescription>
                Configure platform payment settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">Payment Processors</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure payment gateways and processors
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">Platform Fees</h4>
                      <p className="text-sm text-muted-foreground">
                        Set platform fees and commission percentages
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">Tax Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure tax calculation and reporting
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
                    <div>
                      <h4 className="font-medium">Invoice Templates</h4>
                      <p className="text-sm text-muted-foreground">
                        Customize invoice and receipt templates
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
                
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Billing Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Manage API keys and access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-3">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <div className="rounded-lg border border-indigo-100 overflow-hidden">
                    <div className="bg-indigo-50 p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Live API Key</h4>
                        <p className="text-sm text-muted-foreground">
                          For production environment
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          value="sk_live_xxxxxxxxxxxxxxxxxxxxx" 
                          readOnly 
                          className="w-64 bg-white border-indigo-100"
                        />
                        <Button variant="outline">Copy</Button>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Test API Key</h4>
                        <p className="text-sm text-muted-foreground">
                          For development and testing
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          value="sk_test_xxxxxxxxxxxxxxxxxxxxx" 
                          readOnly 
                          className="w-64 border-indigo-100"
                        />
                        <Button variant="outline">Copy</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <h3 className="text-lg font-medium">Webhooks</h3>
                    <div className="rounded-lg border border-indigo-100 p-4">
                      <div className="mb-4">
                        <h4 className="font-medium">Webhook URL</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          URL to receive webhook events
                        </p>
                        <Input 
                          placeholder="https://example.com/webhooks/membify" 
                          className="border-indigo-100"
                        />
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Events to send</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {['payment.success', 'payment.failed', 'user.created', 'subscription.renewed'].map(event => (
                            <div key={event} className="flex items-center space-x-2">
                              <Switch id={event} defaultChecked={true} />
                              <label htmlFor={event} className="text-sm">
                                {event}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save API Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
