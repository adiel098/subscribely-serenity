
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export type AdminRole = 'super_admin' | 'moderator';

export const grantAdminAccess = async (userId: string, role: AdminRole = 'moderator') => {
  try {
    // Check if current user is a super admin
    const { data: adminStatus, error: checkError } = await supabase
      .rpc('get_admin_status', { user_id_param: (await supabase.auth.getUser()).data.user?.id });
      
    if (checkError) {
      console.error("Error checking admin permissions:", checkError);
      throw new Error("You don't have permission to grant admin access");
    }
    
    if (!adminStatus?.is_admin || adminStatus?.admin_role !== 'super_admin') {
      throw new Error("Only super admins can grant admin access");
    }
    
    // Update or insert based on whether user is already an admin
    let result;
    
    // Check if user already has an admin role
    const { data: existingRole } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingRole) {
      // Update existing role
      result = await supabase
        .from('admin_users')
        .update({ role })
        .eq('user_id', userId);
    } else {
      // Insert new admin
      result = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          role: role
        });
    }
    
    if (result.error) throw result.error;
    
    // Log the admin role change
    await supabase.from('system_logs').insert({
      event_type: 'admin_role_granted',
      details: `User granted ${role} role`,
      user_id: userId,
      metadata: { 
        granted_by: (await supabase.auth.getUser()).data.user?.id,
        role: role
      }
    });
    
    // We can't use useToast directly in a non-component function
    // So we'll just return success and let the caller show a toast
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Error granting admin access:", error);
    return { success: false, error };
  }
};

export const revokeAdminAccess = async (userId: string) => {
  try {
    // Check if current user is a super admin
    const { data: adminStatus, error: checkError } = await supabase
      .rpc('get_admin_status', { user_id_param: (await supabase.auth.getUser()).data.user?.id });
      
    if (checkError) {
      console.error("Error checking admin permissions:", checkError);
      throw new Error("You don't have permission to revoke admin access");
    }
    
    if (!adminStatus?.is_admin || adminStatus?.admin_role !== 'super_admin') {
      throw new Error("Only super admins can revoke admin access");
    }
    
    const { data, error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    
    // Log the admin role revocation
    await supabase.from('system_logs').insert({
      event_type: 'admin_role_revoked',
      details: "User's admin privileges revoked",
      user_id: userId,
      metadata: { revoked_by: (await supabase.auth.getUser()).data.user?.id }
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error revoking admin access:", error);
    return { success: false, error };
  }
};

export const updateAdminRole = async (userId: string, newRole: AdminRole) => {
  try {
    // Check if current user is a super admin
    const { data: adminStatus, error: checkError } = await supabase
      .rpc('get_admin_status', { user_id_param: (await supabase.auth.getUser()).data.user?.id });
      
    if (checkError) {
      console.error("Error checking admin permissions:", checkError);
      throw new Error("You don't have permission to update admin roles");
    }
    
    if (!adminStatus?.is_admin || adminStatus?.admin_role !== 'super_admin') {
      throw new Error("Only super admins can update admin roles");
    }
    
    const { data, error } = await supabase
      .from('admin_users')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) throw error;
    
    // Log the admin role update
    await supabase.from('system_logs').insert({
      event_type: 'admin_role_updated',
      details: `Admin role updated to ${newRole}`,
      user_id: userId,
      metadata: { updated_by: (await supabase.auth.getUser()).data.user?.id, new_role: newRole }
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating admin role:", error);
    return { success: false, error };
  }
};

// Use the security definer function to check super admin status
export const checkSuperAdminStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_admin_status', { user_id_param: userId });
    
    if (error) throw error;
    
    return data?.admin_role === 'super_admin';
  } catch (error: any) {
    console.error("Error checking super admin status:", error);
    return false;
  }
};
