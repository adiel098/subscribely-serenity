
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AdminUserRole } from "./types/adminUsers.types";

export const useAdminUserRole = (onSuccess?: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateUserRole = async (userId: string, role: AdminUserRole) => {
    setIsUpdating(true);
    
    try {
      // Check if the current user has permission to modify admin users using security definer function
      const currentUser = await supabase.auth.getUser();
      const { data: adminStatus, error: statusError } = await supabase.rpc(
        'get_admin_status', 
        { user_id_param: currentUser.data.user?.id }
      );
      
      if (statusError) {
        console.error("❌ Error checking admin permissions:", statusError);
        throw statusError;
      }
      
      console.log("🔐 Admin status check result:", adminStatus);
      
      // Handle different response formats
      let isAdmin = false;
      let adminRole = null;
      
      if (Array.isArray(adminStatus) && adminStatus.length > 0) {
        isAdmin = adminStatus[0]?.is_admin === true;
        adminRole = adminStatus[0]?.admin_role;
      } else if (adminStatus) {
        isAdmin = adminStatus.is_admin === true;
        adminRole = adminStatus.admin_role;
      }
      
      if (!isAdmin || adminRole !== 'super_admin') {
        throw new Error("You don't have permission to change user roles");
      }
      
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
      
      // Log the role change
      await supabase.from('system_logs').insert({
        event_type: 'user_role_update',
        details: `User role updated to ${role}`,
        user_id: userId,
        metadata: { updated_by: currentUser.data.user?.id }
      });
      
      toast({
        title: "User role updated",
        description: `User role changed to ${role}`,
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (err: any) {
      console.error("❌ Error updating user role:", err);
      toast({
        variant: "destructive",
        title: "Error updating user role",
        description: err.message,
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateUserRole,
    isUpdating
  };
};
