
import { supabase } from "@/integrations/supabase/client";
import { AdminRole } from "../hooks/types/adminUsers.types";
import { useToast } from "@/components/ui/use-toast";

// Types
export type { AdminRole };

// Admin statistics
export const getAdminStatistics = async () => {
  try {
    const { data, error } = await supabase.rpc('get_admin_statistics');
    
    if (error) throw error;
    
    return data || {
      users: { total: 0, active: 0, new24h: 0, new7d: 0, new30d: 0 },
      communities: { total: 0, active: 0, new24h: 0, new7d: 0, new30d: 0 },
      payments: { total: 0, total24h: 0, total7d: 0, total30d: 0, amount24h: 0, amount7d: 0, amount30d: 0 },
    };
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    throw error;
  }
};

// Get all users for admin view
export const getAllUsers = async () => {
  try {
    const { data: adminUsersData, error: adminUsersError } = await supabase
      .rpc('get_admin_users');
      
    if (adminUsersError) {
      throw adminUsersError;
    }
    
    // Get users data which contains most user information
    // Updated from profiles to users table
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*');
      
    if (usersError) {
      throw usersError;
    }
    
    if (!allUsers) {
      throw new Error("Failed to fetch users data");
    }
    
    // Process the data to create user objects
    const processedUsers = allUsers.map(user => {
      const adminData = adminUsersData?.find(a => a.user_id === user.id);
      const adminRole = adminData?.role || null;
      
      // Set role based on admin status or community ownership
      let role = 'user';
      if (adminRole === 'super_admin') {
        role = 'super_admin';
      } else if (adminRole === 'moderator') {
        role = 'moderator';
      }
      
      // Determine user status based on is_suspended flag
      let status = 'inactive';
      if (user.is_suspended) {
        status = 'suspended';
      } else if (user.last_login) {
        status = 'active';
      }
      
      return {
        id: user.id,
        user_id: user.id,
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] || 'Unknown',
        role: role,
        status: status,
        avatar_url: user.avatar_url || null,
        created_at: user.created_at || '',
        updated_at: user.updated_at || '',
        last_login: user.last_login || null
      };
    });
    
    return processedUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Get only admin users
export const getAdminUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select(`
        *,
        user:user_id (
          email,
          first_name,
          last_name,
          avatar_url
        )
      `);
    
    if (error) throw error;
    
    return data.map(admin => ({
      ...admin,
      email: admin.user?.email,
      full_name: `${admin.user?.first_name || ''} ${admin.user?.last_name || ''}`.trim() || admin.user?.email?.split('@')[0] || 'Unknown',
    }));
  } catch (error) {
    console.error("Error fetching admin users:", error);
    throw error;
  }
};

// Grant admin access to a user
export const grantAdminAccess = async (userId: string, role: AdminRole) => {
  const { toast } = useToast();
  try {
    // First check if user already has admin role
    const { data: existingRole, error: checkError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    let result;
    
    if (existingRole) {
      // Update existing role
      const { data, error } = await supabase
        .from('admin_users')
        .update({ role })
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      result = data;
      
      toast({
        title: "Admin role updated",
        description: `User role updated to ${role}`,
      });
    } else {
      // Insert new role
      const { data, error } = await supabase
        .from('admin_users')
        .insert({ user_id: userId, role })
        .select();
      
      if (error) throw error;
      result = data;
      
      toast({
        title: "Admin access granted",
        description: `User granted ${role} access`,
      });
    }
    
    return result;
  } catch (error) {
    console.error("Error granting admin access:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to grant admin access. Please try again.",
    });
    throw error;
  }
};

// Update user status (active/inactive/suspended)
export const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended') => {
  try {
    // Update the users table
    let updates = {};
    
    if (status === 'suspended') {
      updates = { is_suspended: true, status: 'suspended' };
    } else if (status === 'active') {
      updates = { is_suspended: false, status: 'active', last_login: new Date().toISOString() };
    } else if (status === 'inactive') {
      updates = { is_suspended: false, status: 'inactive', last_login: null };
    }
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: AdminUserRole) => {
  try {
    // If role is admin or moderator, update admin_users table
    if (role === 'super_admin' || role === 'moderator') {
      // Check if user already has an admin role
      const { data: existingRole, error: checkError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('admin_users')
          .update({ role })
          .eq('user_id', userId);
          
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('admin_users')
          .insert({ user_id: userId, role });
          
        if (error) throw error;
      }
    } else {
      // For non-admin roles, remove from admin_users if exists
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// Get all payments (platform + project)
export const getAllPayments = async () => {
  try {
    const { data, error } = await supabase.rpc('get_all_payments');
    
    if (error) throw error;
    
    return data || { platform_payments: [], project_payments: [] };
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
};

// Get all platform subscription plans
export const getPlatformPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('platform_plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching platform plans:", error);
    throw error;
  }
};
