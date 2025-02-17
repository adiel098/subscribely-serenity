import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUsers } from "@/features/admin/components/AdminUsers";
import { AdminStats } from "@/features/admin/components/AdminStats";
import { AdminLogs } from "@/features/admin/components/AdminLogs";
import { ShieldAlert, Loader2, Users, BarChart3, ActivitySquare, Settings2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center space-x-3">
          <ShieldAlert className="h-8 w-8 text-[#9b87f5]" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="dashboard" className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <Card className="bg-[#221F26] border-none">
              <CardContent className="p-4">
                <TabsList className="flex flex-col w-full bg-transparent space-y-1">
                  <TabsTrigger
                    value="dashboard"
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-white"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Dashboard
                  </TabsTrigger>
                  {adminRole === 'super_admin' && (
                    <TabsTrigger
                      value="admins"
                      className="w-full justify-start px-4 py-3 data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-white"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Manage Admins
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="logs"
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-white"
                  >
                    <ActivitySquare className="h-5 w-5 mr-2" />
                    System Logs
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="w-full justify-start px-4 py-3 data-[state=active]:bg-[#1A1F2C] data-[state=active]:text-white"
                  >
                    <Settings2 className="h-5 w-5 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-9">
            <TabsContent value="dashboard" className="space-y-6 mt-0">
              <AdminStats />
            </TabsContent>

            {adminRole === 'super_admin' && (
              <TabsContent value="admins" className="space-y-6 mt-0">
                <Card className="bg-[#221F26] border-none">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Admin Users Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AdminUsers />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="logs" className="space-y-6 mt-0">
              <Card className="bg-[#221F26] border-none">
                <CardHeader>
                  <CardTitle className="text-xl text-white">System Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdminLogs />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0">
              <Card className="bg-[#221F26] border-none">
                <CardHeader>
                  <CardTitle className="text-xl text-white">System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">System settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
