
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
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
      
      // Use the get_admin_users security definer function to avoid recursion
      const { data: adminUsersData, error: adminUsersError } = await supabase
        .rpc('get_admin_users');
        
      if (adminUsersError) {
        console.error("Error fetching admin users:", adminUsersError);
        throw adminUsersError;
      }
      
      console.log("Admin users data:", adminUsersData);
      
      // Get users data which contains most user information
      // Updated from profiles to users table
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*');
        
      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }
      
      if (!allUsers) {
        throw new Error("Failed to fetch users data");
      }
      
      // Fetch communities data with owner information
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id, owner_id');
      
      if (communitiesError) {
        console.error("Error fetching communities:", communitiesError);
        throw communitiesError;
      }
      
      // Get all active platform subscriptions 
      const { data: platformSubscriptions, error: platformSubscriptionsError } = await supabase
        .from('platform_subscriptions')
        .select('owner_id, status, subscription_end_date, plan_id')
        .eq('status', 'active');
        
      if (platformSubscriptionsError) {
        console.error("Error fetching platform subscriptions:", platformSubscriptionsError);
        throw platformSubscriptionsError;
      }
      
      // Fetch project_subscribers to count active subscribers for each community
      const { data: allSubscribers, error: subscribersError } = await supabase
        .from('project_subscribers')
        .select('project_id, subscription_status')
        .eq('is_active', true)
        .eq('subscription_status', 'active');
        
      if (subscribersError) {
        console.error("Error fetching subscribers:", subscribersError);
        throw subscribersError;
      }
      
      console.log("Fetched subscribers:", allSubscribers);
      
      // Process the data to create user objects
      const processedUsers: AdminUser[] = allUsers.map(user => {
        const adminData = adminUsersData?.find(a => a.user_id === user.id);
        const adminRole = adminData?.role || null;
        
        // Get communities owned by this user
        const userCommunities = communities?.filter(c => c.owner_id === user.id) || [];
        const userCommunityIds = userCommunities.map(c => c.id);
        
        // Get active subscriptions for this user
        const userPlatformSubscriptions = platformSubscriptions?.filter(s => 
          s.owner_id === user.id && 
          s.status === 'active' && 
          (!s.subscription_end_date || new Date(s.subscription_end_date) > new Date())
        ) || [];
        
        // Count all active subscribers in user's projects
        const totalSubscribers = allSubscribers?.filter(member => 
          userCommunityIds.includes(member.project_id) && 
          member.subscription_status === 'active'
        ).length || 0;
        
        // Set role based on admin status or community ownership
        let role: AdminUserRole = 'user';
        if (adminRole === 'super_admin') {
          role = 'super_admin';
        } else if (adminRole === 'moderator') {
          role = 'moderator';
        } else if (userCommunities.length > 0) {
          role = 'community_owner';
        }
        
        // Determine user status based on is_suspended flag and active platform subscription
        let status: 'active' | 'inactive' | 'suspended' = 'inactive';
        if (user.is_suspended) {
          status = 'suspended';
        } else if (userPlatformSubscriptions.length > 0) {
          status = 'active';
        } else if (user.last_login) {
          status = 'active';
        }
        
        return {
          id: user.id,
          user_id: user.id, // Match user_id with id to satisfy the AdminUser type
          email: user.email || '',
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Unknown',
          role: role,
          status: status,
          avatar_url: user.avatar_url || null,
          communities_count: userCommunities.length,
          subscriptions_count: totalSubscribers,
          created_at: user.created_at || '',
          updated_at: user.updated_at || '',
          last_login: user.last_login || null
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
