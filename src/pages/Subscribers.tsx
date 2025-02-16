
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useSubscribers } from "@/hooks/useSubscribers";
import { Loader2, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { EditSubscriberDialog } from "@/components/subscribers/EditSubscriberDialog";
import { SubscribersTable } from "@/components/subscribers/SubscribersTable";

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers, isLoading } = useSubscribers(selectedCommunityId || "");
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['subscribers', selectedCommunityId] });
  };

  const handleRemoveSubscriber = async (subscriber: any) => {
    try {
      const { error } = await supabase
        .from('telegram_chat_members')
        .update({
          is_active: false,
          subscription_status: false,
          subscription_end_date: new Date().toISOString(),
        })
        .eq('id', subscriber.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscriber removed successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ['subscribers', selectedCommunityId] });
    } catch (error) {
      console.error('Error removing subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
    }
  };

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

      <SubscribersTable 
        subscribers={subscribers || []}
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
