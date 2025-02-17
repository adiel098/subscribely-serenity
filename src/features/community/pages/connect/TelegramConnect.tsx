import { useEffect, useState } from "react";
import { Button } from "@/features/community/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/features/community/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/features/community/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { Bot, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/features/community/components/ui/dialog";
import { useCommunities } from "@/hooks/community/useCommunities";

const TelegramConnect = () => {
  const [botUsername, setBotUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isBotInGroup, setIsBotInGroup] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();
  const { refetch } = useCommunities();

  useEffect(() => {
    const fetchBotUsername = async () => {
      if (!selectedCommunityId) return;

      try {
        const { data, error } = await supabase
          .from('communities')
          .select('telegram_bot_name')
          .eq('id', selectedCommunityId)
          .single();

        if (error) {
          console.error("Error fetching bot username:", error);
          return;
        }

        if (data && data.telegram_bot_name) {
          setBotUsername(data.telegram_bot_name);
        }
      } catch (error) {
        console.error("Unexpected error fetching bot username:", error);
      }
    };

    fetchBotUsername();
  }, [selectedCommunityId]);

  const handleConnect = async () => {
    if (!selectedCommunityId) {
      toast({
        title: "Error",
        description: "No community selected.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('communities')
        .update({ telegram_bot_name: botUsername })
        .eq('id', selectedCommunityId);

      if (error) {
        console.error("Error updating bot username:", error);
        toast({
          title: "Error",
          description: "Failed to update bot username.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Bot username updated successfully.",
      });
      refetch();
    } catch (error) {
      console.error("Unexpected error updating bot username:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckBotInGroup = async () => {
    if (!selectedCommunityId) {
      toast({
        title: "Error",
        description: "No community selected.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
       const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId: selectedCommunityId,
          path: '/check-bot'
        }
      })

      if (error) {
        console.error("Error checking bot in group:", error);
        toast({
          title: "Error",
          description: "Failed to check bot in group.",
          variant: "destructive",
        });
        return;
      }

      setIsBotInGroup(data.inGroup);
      setOpen(true);
    } catch (error) {
      console.error("Unexpected error checking bot in group:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Telegram Bot</CardTitle>
            <CardDescription>
              Enter your bot's username to connect your Telegram community.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="bot-username"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Bot Username
              </label>
              <input
                type="text"
                id="bot-username"
                placeholder="Enter your bot's username"
                value={botUsername}
                onChange={(e) => setBotUsername(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verify Bot Integration</CardTitle>
            <CardDescription>
              Check if the bot is added to your Telegram group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Click the button below to verify if the bot has been successfully
              added to your Telegram group.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="secondary"
              onClick={handleCheckBotInGroup}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  Check Bot in Group
                  <Bot className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Bot Status</DialogTitle>
              <DialogDescription>
                {isBotInGroup ? (
                  "The bot is successfully added to your Telegram group!"
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4 inline-block align-middle" />
                    The bot is not yet added to your Telegram group. Please add
                    the bot to your group and try again.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => {
                setOpen(false);
                if (isBotInGroup) {
                  navigate("/subscriptions");
                }
              }}>
                {isBotInGroup ? "Continue" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TelegramConnect;
