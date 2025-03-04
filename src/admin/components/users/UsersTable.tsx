
import { useState } from "react";
import { 
  Table, 
  TableBody
} from "@/components/ui/table";
import { AdminUser, AdminUserRole } from "@/admin/hooks/types/adminUsers.types";
import { EditUserDialog } from "./EditUserDialog";
import { TableHeader } from "./table/TableHeader";
import { UserRow } from "./table/UserRow";
import { EmptyState } from "./table/EmptyState";
import { SuspendUserDialog } from "./dialogs/SuspendUserDialog";
import { ActivateUserDialog } from "./dialogs/ActivateUserDialog";

interface UsersTableProps {
  users: AdminUser[];
  onUpdateStatus: (userId: string, status: 'active' | 'inactive' | 'suspended') => Promise<boolean>;
  onUpdateRole: (userId: string, role: AdminUserRole) => Promise<boolean>;
}

export const UsersTable = ({ users, onUpdateStatus, onUpdateRole }: UsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSuspendUser = (user: AdminUser) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const handleActivateUser = (user: AdminUser) => {
    setSelectedUser(user);
    setActivateDialogOpen(true);
  };

  const confirmSuspend = async () => {
    if (selectedUser) {
      await onUpdateStatus(selectedUser.id, 'suspended');
    }
    setSuspendDialogOpen(false);
  };

  const confirmActivate = async () => {
    if (selectedUser) {
      await onUpdateStatus(selectedUser.id, 'active');
    }
    setActivateDialogOpen(false);
  };

  return (
    <>
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
                  onEditUser={handleEditUser}
                  onSuspendUser={handleSuspendUser}
                  onActivateUser={handleActivateUser}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onUpdateStatus={onUpdateStatus}
          onUpdateRole={onUpdateRole}
        />
      )}

      <SuspendUserDialog 
        user={selectedUser}
        isOpen={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        onConfirm={confirmSuspend}
      />

      <ActivateUserDialog
        user={selectedUser}
        isOpen={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        onConfirm={confirmActivate}
      />
    </>
  );
};
