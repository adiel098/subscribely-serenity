
import { supabase } from '@/lib/supabaseClient';
import { AdminRole, AdminStatistics, AdminUser, ApiResponse } from '../hooks/types/admin.types';

// Export the AdminRole type
export type { AdminRole };

/**
 * Gets admin statistics for the dashboard
 */
export const getAdminStatistics = async (): Promise<ApiResponse<AdminStatistics>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-stats', {
      body: { type: 'dashboard' },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error getting admin statistics:', error);
    return { success: false, error: 'Failed to fetch statistics' };
  }
};

/**
 * Gets all users in the system
 */
export const getAdminStatisticsData = async (): Promise<AdminStatistics> => {
  try {
    const response = await getAdminStatistics();
    
    if (!response.success) {
      throw new Error(response.error);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting admin statistics data:', error);
    throw error;
  }
};

/**
 * Gets all users in the system
 */
export const getAllUsers = async (): Promise<ApiResponse<any[]>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'getAll' },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { success: false, error: 'Failed to fetch users' };
  }
};

/**
 * Updates user status (active/inactive)
 */
export const updateUserStatus = async (userId: string, isActive: boolean): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { 
        action: 'updateStatus',
        userId,
        status: isActive ? 'active' : 'inactive'
      },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: 'Failed to update user status' };
  }
};

/**
 * Gets all admin users
 */
export const getAdminUsers = async (): Promise<ApiResponse<AdminUser[]>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'getAdmins' },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error getting admin users:', error);
    return { success: false, error: 'Failed to fetch admin users' };
  }
};

/**
 * Update admin role
 */
export const updateUserRole = async (userId: string, role: AdminRole): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { 
        action: 'updateRole',
        userId,
        role
      },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating admin role:', error);
    return { success: false, error: 'Failed to update admin role' };
  }
};

/**
 * Revoke admin access
 */
export const revokeAdminAccess = async (userId: string): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { 
        action: 'revokeAccess',
        userId
      },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error revoking admin access:', error);
    return { success: false, error: 'Failed to revoke admin access' };
  }
};

/**
 * Grant admin access
 */
export const grantAdminAccess = async (userId: string, role: AdminRole): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: { 
        action: 'grantAccess',
        userId,
        role
      },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error granting admin access:', error);
    return { success: false, error: 'Failed to grant admin access' };
  }
};

/**
 * Gets all payments in the system
 */
export const getAllPayments = async (): Promise<ApiResponse<any>> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-payments', {
      body: { action: 'getAll' },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error getting all payments:', error);
    return { success: false, error: 'Failed to fetch payments' };
  }
};

/**
 * Gets platform plans
 */
export const getPlatformPlans = async (): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-platform-plans', {
      body: { action: 'getAll' },
    });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error getting platform plans:', error);
    return { success: false, error: 'Failed to fetch platform plans' };
  }
};

// Export all necessary functions and types
export {
  getAdminStatistics,
  getAllUsers,
  getAdminUsers,
  getAllPayments,
  getPlatformPlans
};
