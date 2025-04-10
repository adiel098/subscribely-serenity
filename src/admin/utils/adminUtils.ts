// Export the AdminRole enum so it can be used elsewhere
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  MODERATOR = 'moderator'
}

// Admin utility functions
export const grantAdminAccess = async (userId: string, role: AdminRole) => {
  try {
    // Implementation would use your backend service
    console.log(`Granting ${role} access to user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error granting admin access:", error);
    return false;
  }
};

export const revokeAdminAccess = async (userId: string) => {
  try {
    // Implementation would use your backend service
    console.log(`Revoking admin access from user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error revoking admin access:", error);
    return false;
  }
};

// Other admin utility functions...
