
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Shield, CreditCard, Settings, Bell, Crown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PurchaseHistoryTable } from "../components/membify-settings/PurchaseHistoryTable";
import { CurrentPlanCard } from "../components/membify-settings/CurrentPlanCard";

const MembifySettings = () => {
  return (
    <div className="h-full space-y-6 py-[5px] px-[14px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <header className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-500 text-transparent bg-clip-text">
            Membify Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure your Membify platform settings and preferences
          </p>
        </header>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="general" className="flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-1.5">
              <Crown className="h-4 w-4" />
              <span>Plans</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your general platform preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Community Visibility</h4>
                      <p className="text-sm text-muted-foreground">
                        Allow your community to be discovered by other users
                      </p>
                    </div>
                    <Switch id="community-visibility" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Dark Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable dark mode for your dashboard
                      </p>
                    </div>
                    <Switch id="dark-mode" />
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important events
                      </p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">New Subscribers</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone subscribes to your community
                      </p>
                    </div>
                    <Switch id="new-subscribers" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Payment Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payment events
                      </p>
                    </div>
                    <Switch id="payment-notifications" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Platform Updates</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about platform updates and changes
                      </p>
                    </div>
                    <Switch id="platform-updates" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Session Timeout</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out after period of inactivity
                      </p>
                    </div>
                    <Switch id="session-timeout" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your current platform subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <CurrentPlanCard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>View your billing history and payment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-700">Active Subscription</h4>
                        <p className="text-sm text-green-600">
                          Your platform subscription is active and will renew automatically
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Purchase History
                    </h3>
                    <div className="mt-3 bg-white rounded-lg border overflow-hidden">
                      <PurchaseHistoryTable />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default MembifySettings;
