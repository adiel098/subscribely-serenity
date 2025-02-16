
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useSubscribers } from "@/hooks/useSubscribers";
import { Loader2, Users, Search, Filter, CheckSquare, XSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { EditSubscriberDialog } from "@/components/subscribers/EditSubscriberDialog";
import { SubscribersTable } from "@/components/subscribers/SubscribersTable";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers, isLoading, refetch } = useSubscribers(selectedCommunityId || "");
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditSuccess = () => {
    refetch();
  };

  const handleRemoveSubscriber = async (subscriber: any) => {
    console.log('Starting subscription removal process for subscriber:', subscriber);
    
    try {
      console.log('Attempting to update subscription status and end date...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: false,
          subscription_end_date: new Date().toISOString(),
          is_active: false,
          subscription_plan_id: null
        })
        .eq('id', subscriber.id)
        .select();

      console.log('Update response:', { data: updateData, error: updateError });

      if (updateError) {
        console.error('Error in update:', updateError);
        throw updateError;
      }

      console.log('Successfully updated subscriber status');

      toast({
        title: "Success",
        description: "Subscription cancelled successfully",
      });
      
      console.log('Refreshing data...');
      await refetch();
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Detailed error in subscription removal:', error);
      console.error('Error stack:', (error as Error).stack);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };

  const filteredSubscribers = (subscribers || []).filter((subscriber) => {
    const matchesSearch = (subscriber.telegram_username || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      subscriber.telegram_user_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && subscriber.subscription_status) ||
      (statusFilter === "inactive" && !subscriber.subscription_status);

    const matchesPlan =
      !planFilter ||
      subscriber.plan?.id === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Get unique plans for filter
  const uniquePlans = Array.from(
    new Set((subscribers || []).map((s) => s.plan).filter(Boolean))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Subscribers</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your community subscribers and monitor their subscription status
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by username or Telegram ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Status</span>
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {statusFilter}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                <span className="mr-2">All</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                <CheckSquare className="mr-2 h-4 w-4 text-green-500" />
                <span>Active</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                <XSquare className="mr-2 h-4 w-4 text-red-500" />
                <span>Inactive</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Plan</span>
              {planFilter && (
                <Badge variant="secondary" className="ml-2">
                  {uniquePlans.find((p) => p.id === planFilter)?.name}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setPlanFilter(null)}>
                <span className="mr-2">All Plans</span>
              </DropdownMenuItem>
              {uniquePlans.map((plan) => (
                <DropdownMenuItem
                  key={plan.id}
                  onClick={() => setPlanFilter(plan.id)}
                >
                  <span>{plan.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SubscribersTable 
        subscribers={filteredSubscribers}
        onEdit={(subscriber) => {
          setSelectedSubscriber(subscriber);
          setEditDialogOpen(true);
        }}
        onRemove={handleRemoveSubscriber}
      />

      {selectedSubscriber && (
        <EditSubscriberDialog
          subscriber={selectedSubscriber}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Subscribers;
