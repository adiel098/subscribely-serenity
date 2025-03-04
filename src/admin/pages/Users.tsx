
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminManagement } from "@/admin/components/users/AdminManagement";
import { 
  Search, 
  UserPlus, 
  Filter, 
  Loader2,
  RefreshCcw,
  Users as UsersIcon,
  AlertOctagon
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminUsers, AdminUserRole } from "@/admin/hooks/useAdminUsers";
import { UsersTable } from "@/admin/components/users/UsersTable";

const Users = () => {
  const { users, isLoading, error, fetchUsers, updateUserStatus, updateUserRole } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = users.filter(user => {
    // Apply search filter
    const matchesSearch = 
      searchQuery === "" || 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply role filter
    const matchesRole = 
      roleFilter === "all" || 
      user.role === roleFilter;
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === "all" || 
      user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage platform users and permissions 👥
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Tabs defaultValue="all-users" className="space-y-6">
        <TabsList className="bg-background/90 backdrop-blur-sm border">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="admin-management">Admin Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-users" className="space-y-6">
          <Card className="border-indigo-100 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <UsersIcon className="h-5 w-5 mr-2 text-indigo-600" />
                User Directory
              </CardTitle>
              <CardDescription>
                View and manage all platform users
              </CardDescription>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 border-indigo-100"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-[180px]">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="community_owner">Community Owner</SelectItem>
                        <SelectItem value="user">Regular User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-[180px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button variant="outline" 
                    className="border-indigo-100 flex items-center gap-2" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    ) : (
                      <RefreshCcw className="h-4 w-4 text-indigo-600" />
                    )}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex items-center">
                    <AlertOctagon className="h-5 w-5 text-red-600 mr-3" />
                    <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
                  </div>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-2" />
                  <p className="text-sm text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <UsersTable 
                  users={filteredUsers} 
                  onUpdateStatus={updateUserStatus}
                  onUpdateRole={updateUserRole}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin-management" className="space-y-4">
          <AdminManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Users;
