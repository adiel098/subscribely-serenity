
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AdminUser, AdminUserRole } from "./types/adminUsers.types";

export const useAdminUsersFetch = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching users from database...");
      
      // Get current user's admin status using the security definer function
      const currentUser = await supabase.auth.getUser();
      console.log("Current user:", currentUser.data.user);
      
      // Use the fixed security definer function without recursion issues
      const { data: adminUsersData, error: adminUsersError } = await supabase
        .from('admin_users')
        .select('*');
        
      if (adminUsersError) {
        console.error("Error fetching admin users:", adminUsersError);
        throw adminUsersError;
      }
      
      console.log("Admin users data:", adminUsersData);
      
      // Get profiles data which contains most user information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      if (!profiles) {
        throw new Error("Failed to fetch profiles data");
      }
      
      // Get community owners count
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('owner_id');
        
      if (communitiesError) throw communitiesError;
      
      // Process the data to create user objects
      const processedUsers: AdminUser[] = profiles.map(profile => {
        const adminRole = adminUsersData?.find(a => a.user_id === profile.id)?.role || null;
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
        
        // Determine user status based on is_suspended flag and last_login
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

  return {
    users,
    isLoading,
    error,
    fetchUsers
  };
};
