
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminStats } from "@/components/admin/AdminStats";
import { AdminLogs } from "@/components/admin/AdminLogs";
import { Loader2, ShieldAlert } from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: adminRole, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      return data?.role;
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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ShieldAlert className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {adminRole === 'super_admin' && (
            <TabsTrigger value="admins">Manage Admins</TabsTrigger>
          )}
          <TabsTrigger value="logs">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AdminStats />
        </TabsContent>

        {adminRole === 'super_admin' && (
          <TabsContent value="admins" className="space-y-6">
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

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminLogs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
