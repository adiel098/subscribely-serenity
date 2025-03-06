
import React from "react";
import { TableRow } from "@/components/ui/table";
import { Globe, User } from "lucide-react";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";
import { UserCell } from "./row-components/UserCell";
import { StatusCell } from "./row-components/StatusCell";
import { RoleCell } from "./row-components/RoleCell";
import { CountCell } from "./row-components/CountCell";
import { JoinedCell } from "./row-components/JoinedCell";
import { UserActions } from "./row-components/UserActions";

interface UserRowProps {
  user: AdminUser;
  onEditUser: (user: AdminUser) => void;
  onSuspendUser: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
  onUnsuspendUser: (user: AdminUser) => void;
}

export const UserRow = ({ 
  user, 
  onEditUser, 
  onSuspendUser, 
  onActivateUser,
  onUnsuspendUser
}: UserRowProps) => {
  return (
    <TableRow className="hover:bg-muted/30">
      <UserCell user={user} />
      <StatusCell status={user.status} />
      <RoleCell role={user.role} />
      <CountCell 
        count={user.communities_count} 
        icon={<Globe className="h-4 w-4 text-indigo-500" />} 
      />
      <CountCell 
        count={user.subscriptions_count} 
        icon={<User className="h-4 w-4 text-indigo-500" />} 
      />
      <JoinedCell createdAt={user.created_at} />
      <UserActions 
        user={user}
        onEditUser={onEditUser}
        onSuspendUser={onSuspendUser}
        onActivateUser={onActivateUser}
        onUnsuspendUser={onUnsuspendUser}
      />
    </TableRow>
  );
};
