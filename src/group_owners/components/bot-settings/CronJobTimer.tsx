
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const CronJobTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [latestRunError, setLatestRunError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cronStatus, setCronStatus] = useState<string | null>(null);
  const [processedMembers, setProcessedMembers] = useState<number | null>(null);
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();

  const fetchLatestRunStatus = async () => {
    try {
      setIsLoading(true);
      // Get the most recent system log for subscription checks
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .or("event_type.eq.subscription_check,event_type.eq.subscription_check_error,event_type.eq.subscription_check_start")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching latest run status:", error);
        return;
      }

      if (data && data.length > 0) {
        // Find the latest successful completion log
        const successLog = data.find(log => log.event_type === "subscription_check");
        
        if (successLog) {
          setLastCheck(new Date(successLog.created_at));
          setProcessedMembers(successLog.metadata?.processedCount || 0);
          setLatestRunError(null);
        }
        
        // Check for any errors in recent logs
        const errorLog = data.find(log => log.event_type === "subscription_check_error");
        if (errorLog) {
          setLatestRunError(errorLog.details);
        }
      } else {
        console.log("No subscription check logs found");
      }

      // Check cron job status
      const { data: functionResult, error: functionError } = await supabase.rpc(
        "check_cron_job_status",
        { job_name: "check-expired-subscriptions" }
      );

      if (functionError) {
        console.error("Error checking cron job status:", functionError);
      } else if (functionResult && functionResult.length > 0) {
        setCronStatus(functionResult[0].status);
        console.log("Cron job status:", functionResult[0]);
      } else {
        setCronStatus("not_found");
      }
    } catch (err) {
      console.error("Failed to fetch run status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualCheck = async () => {
    try {
      setIsLoading(true);
      toast({
        title: "Triggering subscription check...",
        description: selectedCommunityId 
          ? `Checking subscriptions for this community.` 
          : "Checking all subscriptions.",
        variant: "default"
      });
      
      const payload = selectedCommunityId ? { community_id: selectedCommunityId } : {};
      
      const { error } = await supabase.functions.invoke("check-subscriptions", {
        body: payload
      });

      if (error) {
        toast({
          title: "Error running subscription check",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Subscription check triggered",
        description: selectedCommunityId 
          ? "The check has been manually triggered for this community." 
          : "The check has been manually triggered for all communities.",
        variant: "default"
      });

      // Wait a moment then fetch the updated status
      setTimeout(() => {
        fetchLatestRunStatus();
      }, 3000);
    } catch (err) {
      console.error("Failed to trigger check:", err);
      toast({
        title: "Error",
        description: "Failed to trigger subscription check",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLatestRunStatus();

    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMinute = new Date(now);
      nextMinute.setMinutes(now.getMinutes() + 1);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);
      
      const newTimeLeft = Math.max(0, Math.floor((nextMinute.getTime() - now.getTime()) / 1000));
      
      // If we've reached a new minute, update the last check time
      if (timeLeft === 0) {
        // Fetch the latest status
        fetchLatestRunStatus();
      }
      
      return newTimeLeft;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update timer every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Check status every minute
    const statusChecker = setInterval(() => {
      fetchLatestRunStatus();
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(statusChecker);
    };
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="animate-fade-in bg-purple-100/70 border-purple-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className={cn(
              "h-5 w-5 text-purple-600",
              timeLeft === 0 && "animate-ping"
            )} />
            <CardTitle className="text-lg font-semibold text-purple-900">Subscription Manager</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-purple-50 border-purple-200 hover:bg-purple-200"
            onClick={triggerManualCheck}
            disabled={isLoading}
          >
            <RefreshCw className={cn(
              "h-4 w-4 mr-1",
              isLoading && "animate-spin"
            )} />
            {selectedCommunityId ? "Check This Community" : "Check All"}
          </Button>
        </div>
        <CardDescription className="text-purple-700 font-medium">
          Next check in: {minutes}:{seconds.toString().padStart(2, '0')}
        </CardDescription>
        {lastCheck && (
          <CardDescription className="text-purple-600 text-xs">
            Last check: {lastCheck.toLocaleTimeString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-purple-700">
            Automatically manages subscriptions by checking member status, removing expired members, and sending renewal notifications.
          </p>
          
          {cronStatus && (
            <div className={cn(
              "text-xs font-medium p-1.5 rounded-sm",
              cronStatus === "active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            )}>
              Cron job status: {cronStatus}
            </div>
          )}
          
          {processedMembers !== null && (
            <div className="text-xs text-purple-700">
              Last run processed: {processedMembers} members
            </div>
          )}
          
          {latestRunError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
              <div className="flex items-center gap-1 font-semibold">
                <AlertTriangle className="h-3 w-3" />
                <span>Last run error:</span>
              </div>
              <p className="mt-1">{latestRunError}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
