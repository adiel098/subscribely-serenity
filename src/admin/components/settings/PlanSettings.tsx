
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlatformPlans } from "@/admin/hooks/usePlatformPlans";
import { PlanCard } from "./plans/PlanCard";
import { CreatePlanDialog } from "./plans/CreatePlanDialog";
import { EditPlanDialog } from "./plans/EditPlanDialog";
import { DeletePlanDialog } from "./plans/DeletePlanDialog";
import { PlatformPlan } from "@/admin/hooks/types/platformPlans.types";
import { PlusIcon, LayoutGridIcon } from "lucide-react";

export function PlanSettings() {
  const { plans, isLoading } = usePlatformPlans();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlatformPlan | null>(null);

  const handleEdit = (plan: PlatformPlan) => {
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (plan: PlatformPlan) => {
    setSelectedPlan(plan);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGridIcon className="h-5 w-5 text-indigo-600" />
          Platform Plans
        </CardTitle>
        <CardDescription>
          Manage subscription plans for community owners
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Plans</h3>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-64 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <h3 className="font-medium text-muted-foreground mb-2">No plans defined</h3>
              <p className="text-sm text-muted-foreground/80 mb-4">Create your first platform subscription plan to get started</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                variant="outline"
                className="border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Create Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  onEdit={() => handleEdit(plan)}
                  onDelete={() => handleDelete(plan)}
                />
              ))}
            </div>
          )}
        </div>

        <CreatePlanDialog 
          isOpen={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />

        {selectedPlan && (
          <>
            <EditPlanDialog 
              plan={selectedPlan}
              isOpen={isEditDialogOpen} 
              onOpenChange={setIsEditDialogOpen} 
            />
            
            <DeletePlanDialog 
              plan={selectedPlan}
              isOpen={isDeleteDialogOpen} 
              onOpenChange={setIsDeleteDialogOpen} 
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
