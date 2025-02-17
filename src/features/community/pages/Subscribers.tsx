import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { useSubscribers } from "@/hooks/community/useSubscribers";
import { SubscribersTable } from "@/features/community/components/subscribers/SubscribersTable";
import { Loader2, Users, Search, Filter, CheckSquare, XSquare, RefreshCw, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { EditSubscriberDialog } from "@/components/subscribers/EditSubscriberDialog";
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

interface MSNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName: string) => boolean;
}

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers, isLoading, refetch } = useSubscribers(selectedCommunityId || "");
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleEditSuccess = () => {
    refetch();
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId: selectedCommunityId,
          path: '/update-activity'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member status updated successfully",
      });
      
      await refetch();
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error",
        description: "Failed to update member status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = () => {
    const exportData = filteredSubscribers.map(sub => ({
      Username: sub.telegram_username || 'No username',
      'Telegram ID': sub.telegram_user_id,
      'Plan Name': sub.plan?.name || 'No plan',
      'Plan Price': sub.plan ? `$${sub.plan.price}` : '-',
      'Plan Interval': sub.plan?.interval || '-',
      Status: sub.subscription_status ? 'Active' : 'Inactive',
      'Start Date': sub.subscription_start_date ? new Date(sub.subscription_start_date).toLocaleDateString() : '-',
      'End Date': sub.subscription_end_date ? new Date(sub.subscription_end_date).toLocaleDateString() : '-',
      'Joined At': new Date(sub.joined_at).toLocaleDateString(),
    }));

    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => 
          JSON.stringify(row[header as keyof typeof row])).join(',')
      )
    ];
    const csvString = csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const msNavigator = navigator as MSNavigator;
    
    if (msNavigator.msSaveBlob) {
      msNavigator.msSaveBlob(blob, 'subscribers.csv');
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'subscribers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Success",
      description: "Subscribers data exported successfully",
    });
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Subscribers</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateStatus}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              Update Member Status
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="bg-green-100 hover:bg-green-200 text-green-700 border-green-200"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
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
