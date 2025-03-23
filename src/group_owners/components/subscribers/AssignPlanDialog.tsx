
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { AssignPlanDialog as NewAssignPlanDialog } from "./assign-plan";

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
}

interface AssignPlanDialogProps {
  user: Subscriber | null;
  plans: Plan[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (userId: string, planId: string, endDate: Date) => Promise<void>;
}

export const AssignPlanDialog = (props: AssignPlanDialogProps) => {
  return <NewAssignPlanDialog {...props} />;
};
