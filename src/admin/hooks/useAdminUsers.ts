
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type AdminUserRole = 'super_admin' | 'moderator' | 'community_owner' | 'user';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: AdminUserRole;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string | null;
  communities_count: number;
  subscriptions_count: number;
  created_at: string;
  last_login: string | null;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching users from database...");
      
      // First, get all users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      if (!authUsers || !authUsers.users) {
        throw new Error("Failed to fetch users data");
      }
      
      // Get profile data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Get admin roles
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*');
        
      if (adminError) throw adminError;
      
      // Get community owners count
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('owner_id');
        
      if (communitiesError) throw communitiesError;
      
      // Process the data to combine auth users with profiles and roles
      const processedUsers = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id) || {};
        const adminRole = adminUsers?.find(a => a.user_id === user.id)?.role || null;
        const userCommunities = communities?.filter(c => c.owner_id === user.id) || [];
        
        // Set role based on admin status or community ownership
        let role: AdminUserRole = 'user';
        if (adminRole === 'super_admin') {
          role = 'super_admin';
        } else if (adminRole === 'moderator') {
          role = 'moderator';
        } else if (userCommunities.length > 0) {
          role = 'community_owner';
        }
        
        return {
          id: user.id,
          email: user.email || '',
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          full_name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Unknown',
          role: role,
          status: user.banned ? 'suspended' : user.confirmed_at ? 'active' : 'inactive',
          avatar_url: profile.avatar_url || null,
          communities_count: userCommunities.length,
          subscriptions_count: 0, // We'll need to calculate this from another table if needed
          created_at: user.created_at || '',
          last_login: user.last_sign_in_at || profile.last_login || null
        };
      });
      
      setUsers(processedUsers);
      console.log("✅ Successfully fetched users:", processedUsers.length);
      
    } catch (err: any) {
      console.error("❌ Error fetching users:", err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
    try {
      if (status === 'suspended') {
        // Ban user
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { banned: true }
        );
        if (error) throw error;
      } else if (status === 'active') {
        // Unban user and confirm if needed
        const { error } = await supabase.auth.admin.updateUserById(
          userId,
          { banned: false }
        );
        if (error) throw error;
      }
      
      toast({
        title: "User updated",
        description: `User status changed to ${status}`,
      });
      
      // Refresh the user list
      fetchUsers();
      
      return true;
    } catch (err: any) {
      console.error("❌ Error updating user status:", err);
      toast({
        variant: "destructive",
        title: "Error updating user",
        description: err.message,
      });
      return false;
    }
  };

  const updateUserRole = async (userId: string, role: AdminUserRole) => {
    try {
      // Remove existing admin role if exists
      if (role !== 'super_admin' && role !== 'moderator') {
        const { error: removeError } = await supabase
          .from('admin_users')
          .delete()
          .eq('user_id', userId);
          
        if (removeError) throw removeError;
      } 
      // Set admin role
      else {
        // Check if user already has an admin role
        const { data: existingRole } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (existingRole) {
          // Update existing role
          const { error: updateError } = await supabase
            .from('admin_users')
            .update({ role: role })
            .eq('user_id', userId);
            
          if (updateError) throw updateError;
        } else {
          // Insert new role
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({ user_id: userId, role: role });
            
          if (insertError) throw insertError;
        }
      }
      
      toast({
        title: "User role updated",
        description: `User role changed to ${role}`,
      });
      
      // Refresh the user list
      fetchUsers();
      
      return true;
    } catch (err: any) {
      console.error("❌ Error updating user role:", err);
      toast({
        variant: "destructive",
        title: "Error updating user role",
        description: err.message,
      });
      return false;
    }
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUserStatus,
    updateUserRole
  };
};
