
import { useState, useEffect } from "react";
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
import { ActivateUserWithPlanDialog } from "./dialogs/ActivateUserWithPlanDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  const [activateWithPlanDialogOpen, setActivateWithPlanDialogOpen] = useState(false);
  const [platformPlans, setPlatformPlans] = useState<{ id: string; name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch platform plans when component mounts
    const fetchPlatformPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('platform_plans')
          .select('id, name')
          .eq('is_active', true);
        
        if (error) throw error;
        setPlatformPlans(data || []);
      } catch (error) {
        console.error("Error fetching platform plans:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load subscription plans",
        });
      }
    };

    fetchPlatformPlans();
  }, [toast]);

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
    
    // If we have platform plans, show the plan selection dialog
    if (platformPlans.length > 0) {
      setActivateWithPlanDialogOpen(true);
    } else {
      // Fall back to the simple activation dialog if no plans exist
      setActivateDialogOpen(true);
    }
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

  const confirmActivateWithPlan = async (planId: string, duration: string) => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    
    try {
      // First, update the user status to active
      const statusUpdated = await onUpdateStatus(selectedUser.id, 'active');
      
      if (!statusUpdated) {
        throw new Error("Failed to activate user");
      }
      
      // Then, create a subscription for the user
      const subscriptionEndDate = calculateEndDate(duration);
      
      const { error } = await supabase
        .from('platform_subscriptions')
        .insert({
          owner_id: selectedUser.id,
          plan_id: planId,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          auto_renew: true,
          status: 'active'
        });
      
      if (error) throw error;
      
      toast({
        title: "User activated",
        description: "User has been activated with a subscription plan"
      });
    } catch (error: any) {
      console.error("Error activating user with plan:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to activate user with subscription plan"
      });
    } finally {
      setIsProcessing(false);
      setActivateWithPlanDialogOpen(false);
    }
  };

  const calculateEndDate = (duration: string): Date => {
    const today = new Date();
    
    switch (duration) {
      case 'monthly':
        return new Date(today.setMonth(today.getMonth() + 1));
      case 'quarterly':
        return new Date(today.setMonth(today.getMonth() + 3));
      case 'half-yearly':
        return new Date(today.setMonth(today.getMonth() + 6));
      case 'yearly':
        return new Date(today.setFullYear(today.getFullYear() + 1));
      default:
        return new Date(today.setMonth(today.getMonth() + 1));
    }
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

      <ActivateUserWithPlanDialog
        user={selectedUser}
        isOpen={activateWithPlanDialogOpen}
        onOpenChange={setActivateWithPlanDialogOpen}
        onConfirm={confirmActivateWithPlan}
        plans={platformPlans}
        isLoading={isProcessing}
      />
    </>
  );
};
