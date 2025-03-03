
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type AdminRole = 'super_admin' | 'moderator';

export const grantAdminAccess = async (userId: string, role: AdminRole = 'moderator') => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        user_id: userId,
        role: role
      });

    if (error) throw error;
    
    toast({
      title: "Admin access granted",
      description: `User has been given ${role} privileges.`,
      variant: "default"
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error granting admin access:", error);
    
    toast({
      title: "Error",
      description: error.message || "Failed to grant admin access",
      variant: "destructive"
    });
    
    return { success: false, error };
  }
};

export const revokeAdminAccess = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    
    toast({
      title: "Admin access revoked",
      description: "User's admin privileges have been removed.",
      variant: "default"
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error revoking admin access:", error);
    
    toast({
      title: "Error",
      description: error.message || "Failed to revoke admin access",
      variant: "destructive"
    });
    
    return { success: false, error };
  }
};

export const updateAdminRole = async (userId: string, newRole: AdminRole) => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (error) throw error;
    
    toast({
      title: "Admin role updated",
      description: `User's role updated to ${newRole}.`,
      variant: "default"
    });
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating admin role:", error);
    
    toast({
      title: "Error",
      description: error.message || "Failed to update admin role",
      variant: "destructive"
    });
    
    return { success: false, error };
  }
};
