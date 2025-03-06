
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
      
      // Use the get_admin_users security definer function to avoid recursion
      const { data: adminUsersData, error: adminUsersError } = await supabase
        .rpc('get_admin_users');
        
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
      
      // Fetch telegram_chat_members to count active subscribers for each community
      const { data: allChatMembers, error: chatMembersError } = await supabase
        .from('telegram_chat_members')
        .select('community_id, subscription_status')
        .eq('subscription_status', true)
        .eq('is_active', true);
        
      if (chatMembersError) {
        console.error("Error fetching chat members:", chatMembersError);
        throw chatMembersError;
      }
      
      console.log("Fetched chat members:", allChatMembers);
      
      // Process the data to create user objects
      const processedUsers: AdminUser[] = profiles.map(profile => {
        const adminData = adminUsersData?.find(a => a.user_id === profile.id);
        const adminRole = adminData?.role || null;
        
        // Get communities owned by this user
        const userCommunities = communities?.filter(c => c.owner_id === profile.id) || [];
        const userCommunityIds = userCommunities.map(c => c.id);
        
        // Get active subscriptions for this user
        const userPlatformSubscriptions = platformSubscriptions?.filter(s => 
          s.owner_id === profile.id && 
          s.status === 'active' && 
          (!s.subscription_end_date || new Date(s.subscription_end_date) > new Date())
        ) || [];
        
        // Count all active subscribers in user's communities
        const totalSubscribers = allChatMembers?.filter(member => 
          userCommunityIds.includes(member.community_id) && 
          member.subscription_status === true
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
        if (profile.is_suspended) {
          status = 'suspended';
        } else if (userPlatformSubscriptions.length > 0) {
          status = 'active';
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
          subscriptions_count: totalSubscribers, // This now shows total subscribers across all communities
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
