
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";

export type CronJobStatus = {
  lastCheckTime: Date | null;
  cronStatus: string | null;
  processedMembers: number | null;
  latestRunError: string | null;
  isLoading: boolean;
  timeLeft: number;
};

export const useCronJobStatus = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [latestRunError, setLatestRunError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cronStatus, setCronStatus] = useState<string | null>(null);
  const [processedMembers, setProcessedMembers] = useState<number | null>(null);
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

  return {
    status: {
      lastCheckTime: lastCheck,
      cronStatus,
      processedMembers,
      latestRunError,
      isLoading,
      timeLeft
    },
    fetchLatestRunStatus,
    selectedCommunityId
  };
};
