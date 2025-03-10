
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { CronJobStatus } from "@/group_owners/hooks/useCronJobStatus";

type CronJobStatusInfoProps = {
  status: CronJobStatus;
};

export const CronJobStatusInfo = ({ status }: CronJobStatusInfoProps) => {
  const { cronStatus, processedMembers, latestRunError } = status;

  return (
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
  );
};
