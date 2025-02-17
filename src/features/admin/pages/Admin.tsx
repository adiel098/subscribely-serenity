import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/admin/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/admin/components/ui/card";
import { AdminUsers } from "@/features/admin/components/AdminUsers";
import { AdminStats } from "@/features/admin/components/AdminStats";
import { AdminLogs } from "@/features/admin/components/AdminLogs";
import { 
  ShieldAlert, 
  Loader2, 
  Users, 
  BarChart3, 
  ActivitySquare, 
  Settings2, 
  Database, 
  AlertCircle 
} from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: adminRole, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      const { data: roleData, error } = await supabase.rpc('check_admin_role', {
        user_uuid: user?.id
      });

      if (error) {
        console.error('Error fetching admin role:', error);
        return null;
      }

      return roleData;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!isLoading && !adminRole) {
      navigate('/dashboard');
    }
  }, [adminRole, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  if (!adminRole) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage system settings and monitor platform activity
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,345</div>
              <p className="text-xs text-muted-foreground">
                +180 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Communities</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">
                +22 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.9%</div>
              <p className="text-xs text-muted-foreground">
                Uptime last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            {adminRole === 'super_admin' && (
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Manage Admins
              </TabsTrigger>
            )}
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <ActivitySquare className="h-4 w-4" />
              System Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AdminStats />
          </TabsContent>

          {adminRole === 'super_admin' && (
            <TabsContent value="admins" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Users Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminUsers />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminLogs />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium">General Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure system-wide settings and preferences
                    </p>
                  </div>
                  <div className="grid gap-4">
                    <p className="text-muted-foreground">Settings coming soon...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
