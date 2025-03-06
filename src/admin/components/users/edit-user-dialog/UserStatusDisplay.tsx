
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";
import { UserStatusBadge } from "../UserStatusBadge";
import { UserRoleBadge } from "../UserRoleBadge";

interface UserStatusDisplayProps {
  user: AdminUser;
}

export const UserStatusDisplay = ({ user }: UserStatusDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Current Status</h3>
        <UserStatusBadge status={user.status} />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Current Role</h3>
        <UserRoleBadge role={user.role} />
      </div>
    </div>
  );
};
