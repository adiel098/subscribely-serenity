import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, AlertCircle, CheckCircle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { AdminRole } from '@/admin/utils/adminTypes';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole | null;
  created_at: string;
}

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("moderator");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*, users(email, full_name, created_at)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAdmins = data.map(admin => ({
        id: admin.user_id,
        email: admin.users?.email || 'Unknown',
        full_name: admin.users?.full_name || 'Unknown User',
        role: admin.role as AdminRole,
        created_at: admin.users?.created_at || admin.created_at
      }));

      setAdmins(formattedAdmins);
    } catch (err: any) {
      console.error("Error fetching admins:", err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error fetching admin users",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.trim())
        .single();

      if (userError) {
        throw new Error(`User not found with email: ${email}`);
      }

      // Then add them as an admin
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          user_id: userData.id,
          role: role
        });

      if (adminError) {
        if (adminError.code === '23505') { // Unique violation
          throw new Error(`User is already an admin`);
        }
        throw adminError;
      }

      toast({
        title: "Admin added successfully",
        description: `${email} has been granted ${role} privileges`,
      });

      setEmail("");
      fetchAdmins();
    } catch (err: any) {
      console.error("Error adding admin:", err);
      toast({
        variant: "destructive",
        title: "Failed to add admin",
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Admin removed",
        description: "User's admin privileges have been revoked",
      });

      fetchAdmins();
    } catch (err: any) {
      console.error("Error removing admin:", err);
      toast({
        variant: "destructive",
        title: "Failed to remove admin",
        description: err.message,
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: AdminRole) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `Admin role has been updated to ${newRole}`,
      });

      fetchAdmins();
    } catch (err: any) {
      console.error("Error updating role:", err);
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: err.message,
      });
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 flex items-center gap-1">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Add New Admin
          </CardTitle>
          <CardDescription>
            Grant administrative privileges to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  placeholder="Enter user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Admin Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as AdminRole)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Admin
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Admin Users
          </CardTitle>
          <CardDescription>
            Manage existing admin users and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading admins</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No admin users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.full_name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{getRoleBadge(admin.role as AdminRole)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={admin.role || undefined}
                            onValueChange={(value) => handleUpdateRole(admin.id, value as AdminRole)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveAdmin(admin.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
