
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Save, Globe, AlertTriangle } from "lucide-react";
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

const generalFormSchema = z.object({
  siteName: z.string().min(2, { message: "Site name must be at least 2 characters" }),
  siteUrl: z.string().url({ message: "Please enter a valid URL" }),
  adminEmail: z.string().email({ message: "Please enter a valid email" }),
  supportEmail: z.string().email({ message: "Please enter a valid email" }),
  defaultLanguage: z.string(),
  maintenance: z.boolean(),
});

export type GeneralFormValues = z.infer<typeof generalFormSchema>;

interface GeneralSettingsProps {
  onSave: (data: GeneralFormValues) => void;
  isSaving: boolean;
}

export function GeneralSettings({ onSave, isSaving }: GeneralSettingsProps) {
  // General Settings Form
  const generalForm = useForm<GeneralFormValues>({
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

  return (
    <div className="space-y-6">
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
            <form onSubmit={generalForm.handleSubmit(onSave)} className="space-y-6">
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
    </div>
  );
}
