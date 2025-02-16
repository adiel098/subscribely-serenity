
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useSubscribers } from "@/hooks/useSubscribers";
import { format } from "date-fns";
import { 
  Loader2, 
  Users,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

interface EditSubscriberDialogProps {
  subscriber: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditSubscriberDialog = ({ subscriber, open, onOpenChange, onSuccess }: EditSubscriberDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [username, setUsername] = useState(subscriber.telegram_username || "");
  const [subscriptionStatus, setSubscriptionStatus] = useState(subscriber.subscription_status);
  const [startDate, setStartDate] = useState(subscriber.subscription_start_date || "");
  const [endDate, setEndDate] = useState(subscriber.subscription_end_date || "");

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('telegram_chat_members')
        .update({
          telegram_username: username,
          subscription_status: subscriptionStatus,
          subscription_start_date: startDate || null,
          subscription_end_date: endDate || null,
        })
        .eq('id', subscriber.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscriber updated successfully",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating subscriber:', error);
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
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Subscribers = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers, isLoading } = useSubscribers(selectedCommunityId || "");
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['subscribers', selectedCommunityId] });
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

      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">User</TableHead>
              <TableHead className="font-medium">Telegram ID</TableHead>
              <TableHead className="font-medium">Subscription Plan</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Subscription Period</TableHead>
              <TableHead className="font-medium">Activity</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers && subscribers.length > 0 ? (
              subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>
                        {subscriber.telegram_username ? (
                          <a
                            href={`https://t.me/${subscriber.telegram_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            @{subscriber.telegram_username}
                          </a>
                        ) : (
                          "No username"
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{subscriber.telegram_user_id}</TableCell>
                  <TableCell>
                    {subscriber.plan ? (
                      <>
                        <div className="font-medium">{subscriber.plan.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {subscriber.plan.interval} - ${subscriber.plan.price}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No plan</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={subscriber.subscription_status ? "success" : "destructive"}>
                      {subscriber.subscription_status ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {subscriber.subscription_start_date
                          ? format(new Date(subscriber.subscription_start_date), "PPp")
                          : "-"}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {subscriber.subscription_end_date
                          ? format(new Date(subscriber.subscription_end_date), "PPp")
                          : "-"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Joined: {format(new Date(subscriber.joined_at), "PPp")}
                      </div>
                      {subscriber.last_active && (
                        <div className="text-sm text-muted-foreground">
                          Last active: {format(new Date(subscriber.last_active), "PPp")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSubscriber(subscriber);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">No subscribers found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
