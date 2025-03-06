
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRow } from "./table/UserRow";
import { TableHeader as UsersTableHeader } from "./table/TableHeader";
import { EmptyState } from "./table/EmptyState";
import { AdminUser } from "@/admin/hooks/types/adminUsers.types";

interface UserTableContentProps {
  users: AdminUser[];
  onEditUser: (user: AdminUser) => void;
  onSuspendUser: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
  onUnsuspendUser: (user: AdminUser) => void;
}

export const UserTableContent = ({ 
  users,
  onEditUser,
  onSuspendUser,
  onActivateUser,
  onUnsuspendUser
}: UserTableContentProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <UsersTableHeader />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <EmptyState colSpan={7} />
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEditUser={onEditUser}
                onSuspendUser={onSuspendUser}
                onActivateUser={onActivateUser}
                onUnsuspendUser={onUnsuspendUser}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
