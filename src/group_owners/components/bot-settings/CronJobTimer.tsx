
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const CronJobTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [latestRunError, setLatestRunError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchLatestRunStatus = async () => {
    try {
      setIsLoading(true);
      // Get the most recent system log for subscription checks
      const { data, error } = await supabase
        .from("system_logs")
        .select("*")
        .or("event_type.eq.subscription_check,event_type.eq.subscription_check_error")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching latest run status:", error);
        return;
      }

      if (data && data.length > 0) {
        const latestLog = data[0];
        setLastCheck(new Date(latestLog.created_at));
        
        if (latestLog.event_type === "subscription_check_error") {
          setLatestRunError(latestLog.details);
        } else {
          setLatestRunError(null);
        }
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
      const { error } = await supabase.functions.invoke("check-subscriptions", {
        body: {}
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
        description: "The check has been manually triggered and will run shortly.",
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

    return () => clearInterval(timer);
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
            Run Now
          </Button>
        </div>
        <CardDescription className="text-purple-700 font-medium">
          Next check in: {minutes}:{seconds.toString().padStart(2, '0')}
        </CardDescription>
        <CardDescription className="text-purple-600 text-xs">
          Last check: {lastCheck.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-purple-700">
          Automatically manages subscriptions by checking member status, removing expired members, and sending renewal notifications every minute.
        </p>
        {latestRunError && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
            <p className="font-semibold">Last run error:</p>
            <p>{latestRunError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
