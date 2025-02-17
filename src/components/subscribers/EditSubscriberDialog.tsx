
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  const [subscriptionStatus, setSubscriptionStatus] = useState(subscriber.subscription_status);
  const [startDate, setStartDate] = useState(
    subscriber.subscription_start_date ? 
    new Date(subscriber.subscription_start_date).toISOString().slice(0, 16) : 
    ""
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

      // עדכון פרטי המנוי במסד הנתונים
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          telegram_username: username,
          subscription_status: subscriptionStatus,
          subscription_start_date: startDate || null,
          subscription_end_date: endDate || null,
          // אם המנוי מבוטל, מעדכנים גם את is_active לfalse
          ...(subscriptionStatus === false && { is_active: false })
        })
        .eq('id', subscriber.id);

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        throw updateError;
      }

      // אם המנוי בוטל, מסירים את המשתמש מהערוץ
      if (!subscriptionStatus && subscriber.subscription_status) {
        console.log('Subscription cancelled, removing member from channel...');
        
        const { error: kickError } = await supabase.functions.invoke('telegram-webhook', {
          body: { 
            path: '/remove-member',
            chat_id: subscriber.community_id,
            user_id: subscriber.telegram_user_id 
          }
        });

        if (kickError) {
          console.error('Error removing member from channel:', kickError);
          throw new Error('Failed to remove member from channel');
        }
      }

      toast({
        title: "Success",
        description: subscriptionStatus ? 
          "Subscriber updated successfully" : 
          "Subscription cancelled and member removed from channel",
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
          <div className="flex items-center space-x-2">
            <Label htmlFor="subscription-status">Subscription Status</Label>
            <Switch
              id="subscription-status"
              checked={subscriptionStatus}
              onCheckedChange={setSubscriptionStatus}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
            variant={!subscriptionStatus ? "destructive" : "default"}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {!subscriptionStatus ? "Cancelling..." : "Saving..."}
              </>
            ) : (
              !subscriptionStatus ? "Cancel Subscription" : "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
