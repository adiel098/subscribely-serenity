import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useNavigate } from "react-router-dom";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/group_owners/components/subscriptions/columns";
import { SubscriptionPlanForm } from "@/group_owners/components/subscriptions/SubscriptionPlanForm";

const Subscriptions = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { plans, isLoading, createPlan, updatePlan, deletePlan } = useSubscriptionPlans(selectedCommunityId || "");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleCreate = () => {
    setSelectedPlan(null);
    setOpen(true);
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setOpen(true);
  };

  if (!selectedCommunityId) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Community Selected</h2>
          <p className="text-gray-500">Please select a community to view subscription plans.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6 py-[5px] px-[14px]">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Subscription Plans</h1>
        <Button onClick={handleCreate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Manage your subscription plans and pricing for your community
      </p>
      <DataTable columns={columns(handleEdit, deletePlan)} data={plans || []} />
      <SubscriptionPlanForm
        open={open}
        setOpen={setOpen}
        onSubmit={selectedPlan ? updatePlan.mutate : createPlan.mutate}
        isLoading={selectedPlan ? updatePlan.isPending : createPlan.isPending}
        plan={selectedPlan}
        communityId={selectedCommunityId}
      />
    </div>
  );
};

export default Subscriptions;
