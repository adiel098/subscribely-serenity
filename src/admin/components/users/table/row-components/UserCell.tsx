
import React from "react";
import { TableCell } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";

interface UserCellProps {
  user: AdminUser;
}

export const UserCell = ({ user }: UserCellProps) => {
  return (
    <TableCell>
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8 border border-primary/10">
          {user.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={user.full_name || ''} />
          ) : (
            <AvatarFallback className="bg-primary/5 text-primary-foreground">
              {user.full_name
                ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                : user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
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
