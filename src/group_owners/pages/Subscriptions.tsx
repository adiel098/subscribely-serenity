import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, AlertCircle, Sparkles, PlusCircle, Clock, Tag, CreditCard, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTitle } from "@/components/ui/alert-title";
import { useToast } from "@/components/ui/use-toast";
import { useProjectContext } from "@/contexts/ProjectContext";
import { SubscriptionPlanCard } from "@/group_owners/components/subscriptions/SubscriptionPlanCard";
import { CreatePlanDialog } from "@/group_owners/components/subscriptions/CreatePlanDialog";
import { EditPlanDialog } from "@/group_owners/components/subscriptions/EditPlanDialog";
import { useSubscriptionPlans } from "@/group_owners/hooks/useSubscriptionPlans";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionPlan } from "@/group_owners/hooks/types/subscription.types";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Subscriptions = () => {
  const navigate = useNavigate();
  const { selectedProjectId } = useProjectContext();
  const { toast } = useToast();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const {
    plans,
    isLoading,
    isError,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
  } = useSubscriptionPlans(selectedProjectId || undefined);

  useEffect(() => {
    if (!selectedProjectId) {
      navigate("/dashboard");
    }
  }, [selectedProjectId, navigate]);

  const handleCreatePlan = async (data: any) => {
    if (!selectedProjectId) return;
    await createPlan.mutateAsync({
      ...data,
      project_id: selectedProjectId,
      community_id: selectedProjectId, 
    });
    toast({
      title: "Plan created",
      description: "Your subscription plan has been created successfully.",
    });
    setShowCreateDialog(false);
  };

  const handleUpdatePlan = async (data: any) => {
    if (!editPlan) return;
    await updatePlan.mutateAsync({
      id: editPlan.id,
      ...data,
    });
    toast({
      title: "Plan updated",
      description: "Your subscription plan has been updated successfully.",
    });
    setShowEditDialog(false);
    setEditPlan(null);
  };

  const handleDeletePlan = async (planId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this plan?");
    if (!confirm) return;

    await deletePlan.mutateAsync(planId);
    toast({
      title: "Plan deleted",
      description: "Your subscription plan has been deleted.",
    });
  };

  const handleToggleStatus = async (planId: string, is_active: boolean) => {
    await togglePlanStatus.mutateAsync({ planId, is_active });
    toast({
      title: is_active ? "Plan activated" : "Plan deactivated",
      description: `Your subscription plan has been ${is_active ? "activated" : "deactivated"}.`,
    });
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditPlan(plan);
    setShowEditDialog(true);
  };

  const filteredPlans = () => {
    if (activeTab === "all") return plans;
    if (activeTab === "active") return plans?.filter(plan => plan.is_active);
    if (activeTab === "inactive") return plans?.filter(plan => !plan.is_active);
    return plans;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Subscription Plans
              </h1>
              <p className="text-muted-foreground mt-1">Manage your subscription offerings and pricing</p>
            </div>
            <Skeleton className="w-32 h-10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border border-muted shadow-sm">
                <CardHeader className="bg-muted/30 pb-4 space-y-1">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="pt-6 pb-2">
                  <Skeleton className="h-8 w-24 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </CardContent>
                <CardFooter className="px-6 py-4 border-t bg-muted/20">
                  <Skeleton className="h-4 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load subscription plans. {error instanceof Error ? error.message : String(error)}
          </AlertDescription>
        </Alert>
        
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const planStats = {
    total: plans?.length || 0,
    active: plans?.filter(plan => plan.is_active).length || 0,
    inactive: plans?.filter(plan => !plan.is_active).length || 0,
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Subscription Plans
              </h1>
              <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {planStats.total} Plans
              </span>
            </div>
            <p className="text-muted-foreground mt-1">Create and manage subscription plans for your community</p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </motion.div>
        </div>
        
        {/* Stats cards */}
        {plans && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-100 dark:border-blue-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Plans</p>
                  <p className="text-2xl font-bold">{planStats.total}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-100 dark:border-green-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Plans</p>
                  <p className="text-2xl font-bold">{planStats.active}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border-orange-100 dark:border-orange-800">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Inactive Plans</p>
                  <p className="text-2xl font-bold">{planStats.inactive}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Tabs for filtering */}
        {plans && plans.length > 0 && (
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
              <TabsTrigger value="all" className="text-sm">
                All Plans
              </TabsTrigger>
              <TabsTrigger value="active" className="text-sm">
                Active
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-sm">
                Inactive
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <RenderPlans plans={filteredPlans()} {...{ handleEditPlan, handleDeletePlan, handleToggleStatus }} />
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              <RenderPlans plans={filteredPlans()} {...{ handleEditPlan, handleDeletePlan, handleToggleStatus }} />
            </TabsContent>
            
            <TabsContent value="inactive" className="mt-0">
              <RenderPlans plans={filteredPlans()} {...{ handleEditPlan, handleDeletePlan, handleToggleStatus }} />
            </TabsContent>
          </Tabs>
        )}

        {/* Empty state */}
        {(!plans || plans.length === 0) && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-100 dark:border-purple-800 shadow-sm">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No subscription plans yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create subscription plans to monetize your community. Offer different tiers and benefits to attract subscribers.
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        {showCreateDialog && (
          <CreatePlanDialog 
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            projectId={selectedProjectId || ''}
            onSubmit={handleCreatePlan}
          />
        )}

        {editPlan && (
          <EditPlanDialog
            plan={editPlan}
            isOpen={showEditDialog}
            onOpenChange={setShowEditDialog}
            onSubmit={handleUpdatePlan}
          />
        )}
      </motion.div>
    </div>
  );
};

// Extracted component for rendering plans
const RenderPlans = ({ 
  plans, 
  handleEditPlan, 
  handleDeletePlan, 
  handleToggleStatus 
}: { 
  plans?: SubscriptionPlan[], 
  handleEditPlan: (plan: SubscriptionPlan) => void,
  handleDeletePlan: (planId: string) => Promise<void>,
  handleToggleStatus: (planId: string, is_active: boolean) => Promise<void>
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {plans?.map((plan) => (
        <motion.div key={plan.id} variants={itemVariants}>
          <SubscriptionPlanCard
            plan={plan as any}
            onUpdate={handleEditPlan}
            onDelete={handleDeletePlan}
            onToggleStatus={handleToggleStatus}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Subscriptions;
