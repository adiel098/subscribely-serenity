
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditSubscriberDialogProps {
  subscriber: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditSubscriberDialog = ({ subscriber, open, onOpenChange, onSuccess }: EditSubscriberDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [username, setUsername] = useState(subscriber.telegram_username || "");
  const [subscriptionStatus, setSubscriptionStatus] = useState(subscriber.subscription_status || "inactive");
  const [startDate, setStartDate] = useState(
    subscriber.subscription_start_date ? 
    new Date(subscriber.subscription_start_date).toISOString().slice(0, 16) : 
    new Date().toISOString().slice(0, 16)  // Set current date as default for new subscriptions
  );
  const [endDate, setEndDate] = useState(
    subscriber.subscription_end_date ? 
    new Date(subscriber.subscription_end_date).toISOString().slice(0, 16) : 
    ""
  );

  const handleSave = async () => {
    try {
      setIsLoading(true);
      console.log('Updating subscriber:', {
        id: subscriber.id,
        telegram_username: username,
        subscription_status: subscriptionStatus,
        subscription_start_date: startDate,
        subscription_end_date: endDate
      });

      // If subscription is being deactivated or removed, make sure we have proper dates
      const currentDate = new Date().toISOString();
      
      // Determine is_active value based on subscription_status
      const isActive = subscriptionStatus === "active";
      
      const updateData = {
        telegram_username: username,
        subscription_status: subscriptionStatus,
        is_active: isActive, // Update based on status
        subscription_start_date: isActive ? (startDate || currentDate) : null,
        subscription_end_date: subscriptionStatus === "expired" ? currentDate : (endDate || null)
      };

      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update(updateData)
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        throw updateError;
      }

      // If subscription is cancelled or removed, use the kick-member function with appropriate reason
      if (subscriptionStatus === "removed" || (subscriptionStatus === "inactive" && subscriber.subscription_status === "active")) {
        console.log('Subscription cancelled/removed, removing member from channel...');
        
        // Use the kick-member function
        const { error: kickError } = await supabase.functions.invoke('kick-member', {
          body: { 
            memberId: subscriber.id,
            reason: subscriptionStatus // Pass the exact status (removed or inactive)
          }
        });

        if (kickError) {
          console.error('Error removing member from channel:', kickError);
          throw new Error('Failed to remove member from channel');
        }
      }

      // Handle the expired status specifically
      if (subscriptionStatus === "expired" && subscriber.subscription_status !== "expired") {
        console.log('Marking subscription as expired...');
        
        // Use the kick-member function with expired reason
        const { error: kickError } = await supabase.functions.invoke('kick-member', {
          body: { 
            memberId: subscriber.id,
            reason: 'expired'
          }
        });

        if (kickError) {
          console.error('Error processing expired member:', kickError);
          throw new Error('Failed to process expired member');
        }
      }

      let successMessage = "Subscriber updated successfully";
      if (subscriptionStatus === "removed") {
        successMessage = "Subscription cancelled and member removed from channel";
      } else if (subscriptionStatus === "inactive" && subscriber.subscription_status === "active") {
        successMessage = "Subscription deactivated and member removed from channel";
      } else if (subscriptionStatus === "expired") {
        successMessage = "Subscription marked as expired and member removed from channel";
      }

      toast({
        title: "Success",
        description: successMessage,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error handling subscription update:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriber",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subscriber</DialogTitle>
          <DialogDescription>
            Update subscriber details and subscription status
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Telegram username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subscription-status">Subscription Status</Label>
            <Select
              value={subscriptionStatus}
              onValueChange={setSubscriptionStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={subscriptionStatus !== "active"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={subscriptionStatus !== "active"}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            variant={subscriptionStatus === "removed" ? "destructive" : "default"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {subscriptionStatus === "removed" ? "Removing..." : "Saving..."}
              </>
            ) : (
              subscriptionStatus === "removed" ? "Remove Subscriber" : "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
