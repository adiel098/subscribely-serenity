import { supabase } from "@/lib/supabaseClient";
import { AdminRole } from "@/admin/hooks/types/adminUsers.types";

// Admin functions

export const grantAdminAccess = async (userId: string, role: AdminRole) => {
  try {
    // First, check if the user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Update or insert admin role
    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        user_id: userId,
        role: role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Failed to grant admin access:", error);
    throw error;
  }
};

// Function to get admin statistics
export const getAdminStatistics = async () => {
  try {
    const { data, error } = await supabase.from('admin_statistics').select('*').single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get admin statistics:", error);
    throw error;
  }
};

// Function to get all users
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get all users:", error);
    throw error;
  }
};

// Function to get admin users
export const getAdminUsers = async () => {
  try {
    const { data, error } = await supabase.from('admin_users').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get admin users:", error);
    throw error;
  }
};

// Function to get all payments
export const getAllPayments = async () => {
  try {
    const { data, error } = await supabase.from('payments').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get all payments:", error);
    throw error;
  }
};

// Function to get platform plans
export const getPlatformPlans = async () => {
  try {
    const { data, error } = await supabase.from('platform_plans').select('*');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get platform plans:", error);
    throw error;
  }
};
