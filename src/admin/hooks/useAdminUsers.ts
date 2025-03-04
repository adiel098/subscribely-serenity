
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
      
      // Get profiles data which contains most user information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      if (!profiles) {
        throw new Error("Failed to fetch profiles data");
      }
      
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
      
      // Process the data to create user objects
      const processedUsers: AdminUser[] = profiles.map(profile => {
        const adminRole = adminUsers?.find(a => a.user_id === profile.id)?.role || null;
        const userCommunities = communities?.filter(c => c.owner_id === profile.id) || [];
        
        // Set role based on admin status or community ownership
        let role: AdminUserRole = 'user';
        if (adminRole === 'super_admin') {
          role = 'super_admin';
        } else if (adminRole === 'moderator') {
          role = 'moderator';
        } else if (userCommunities.length > 0) {
          role = 'community_owner';
        }
        
        // Determine user status - in a real application, you would store this in a user_metadata field
        // For now, we'll assume active if they have a last_login
        let status: 'active' | 'inactive' | 'suspended' = 'inactive';
        if (profile.is_suspended) {
          status = 'suspended';
        } else if (profile.last_login) {
          status = 'active';
        }
        
        return {
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          full_name: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email?.split('@')[0] || 'Unknown',
          role: role,
          status: status,
          avatar_url: profile.avatar_url || null,
          communities_count: userCommunities.length,
          subscriptions_count: 0, // We'll need to calculate this from another table if needed
          created_at: profile.created_at || '',
          last_login: profile.last_login || null
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
      // Since we don't have direct access to auth.admin API from the client,
      // we'll update a field in the profiles table instead
      let updates = {};
      
      if (status === 'suspended') {
        updates = { is_suspended: true };
      } else if (status === 'active') {
        updates = { is_suspended: false, last_login: new Date().toISOString() };
      } else if (status === 'inactive') {
        updates = { is_suspended: false, last_login: null };
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
        
      if (error) throw error;
      
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
