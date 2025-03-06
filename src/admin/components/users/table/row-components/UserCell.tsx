
import React from "react";
import { TableCell } from "@/components/ui/table";
import { Mail } from "lucide-react";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";

interface UserCellProps {
  user: AdminUser;
}

export const UserCell = ({ user }: UserCellProps) => {
  return (
    <TableCell>
      <div className="flex items-center">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">{user.full_name || 'Unknown'}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <Mail className="mr-1 h-3 w-3" /> {user.email}
          </div>
        </div>
      </div>
    </TableCell>
  );
};
