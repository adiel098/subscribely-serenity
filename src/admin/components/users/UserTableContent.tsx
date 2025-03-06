
import { Table, TableBody } from "@/components/ui/table";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";
import { TableHeader } from "./table/TableHeader";
import { UserRow } from "./table/UserRow";
import { EmptyState } from "./table/EmptyState";

interface UserTableContentProps {
  users: AdminUser[];
  onEditUser: (user: AdminUser) => void;
  onSuspendUser: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
}

export const UserTableContent = ({
  users,
  onEditUser,
  onSuspendUser,
  onActivateUser
}: UserTableContentProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader />
        <TableBody>
          {users.length === 0 ? (
            <EmptyState />
          ) : (
            users.map((user) => (
              <UserRow 
                key={user.id}
                user={user}
                onEditUser={onEditUser}
                onSuspendUser={onSuspendUser}
                onActivateUser={onActivateUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
