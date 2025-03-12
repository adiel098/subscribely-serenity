
import { useState, useEffect, useCallback } from "react";
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

// Cache for system logs to reduce API calls
interface LogsCache {
  data: any[] | null;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache for system logs
const systemLogsCache: LogsCache = {
  data: null,
  timestamp: 0,
  expiresAt: 0
};

// Cache expiration time in milliseconds (2 minutes)
const CACHE_DURATION = 1000 * 60 * 2;

export const useCronJobStatus = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [latestRunError, setLatestRunError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cronStatus, setCronStatus] = useState<string | null>(null);
  const [processedMembers, setProcessedMembers] = useState<number | null>(null);
  const { selectedCommunityId } = useCommunityContext();
  const [retryCount, setRetryCount] = useState<number>(0);

  // Helper function to check if cache is valid
  const isCacheValid = useCallback(() => {
    return systemLogsCache.data !== null && Date.now() < systemLogsCache.expiresAt;
  }, []);

  const fetchLatestRunStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      let logData;
      
      // Use cache if available and valid
      if (isCacheValid()) {
        console.log("🔄 Using cached system logs");
        logData = systemLogsCache.data;
      } else {
        console.log("🔍 Fetching fresh system logs");
        
        // Use the security definer function to get system logs
        const { data, error } = await supabase
          .rpc("get_system_logs", {
            event_types: ["subscription_check", "subscription_check_error", "subscription_check_start"],
            limit_count: 5
          });

        if (error) {
          console.error("❌ Error fetching system logs:", error);
          
          // Implement exponential backoff retry
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`⏱️ Retrying in ${delay/1000} seconds...`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchLatestRunStatus();
            }, delay);
          }
          
          return;
        }

        // Update cache
        systemLogsCache.data = data;
        systemLogsCache.timestamp = Date.now();
        systemLogsCache.expiresAt = Date.now() + CACHE_DURATION;
        
        logData = data;
        // Reset retry count on success
        setRetryCount(0);
      }

      if (logData && logData.length > 0) {
        // Find the latest successful completion log
        const successLog = logData.find(log => log.event_type === "subscription_check");
        
        if (successLog) {
          setLastCheck(new Date(successLog.created_at));
          setProcessedMembers(successLog.metadata?.processedCount || 0);
          setLatestRunError(null);
        }
        
        // Check for any errors in recent logs
        const errorLog = logData.find(log => log.event_type === "subscription_check_error");
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
  }, [isCacheValid, retryCount]);

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
      // Only fetch if cache is expired
      if (!isCacheValid()) {
        fetchLatestRunStatus();
      }
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(statusChecker);
    };
  }, [timeLeft, fetchLatestRunStatus, isCacheValid]);

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
