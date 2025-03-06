
import React from "react";
import { TableCell } from "@/components/ui/table";
import { UserRoleBadge } from "../../UserRoleBadge";
import { AdminUserRole } from "@/admin/hooks/types/adminUsers.types";

interface RoleCellProps {
  role: AdminUserRole;
}

export const RoleCell = ({ role }: RoleCellProps) => {
  return (
    <TableCell className="min-w-[160px]">
      <div className="flex justify-center">
        <UserRoleBadge role={role} size="sm" />
      </div>
    </TableCell>
  );
};
