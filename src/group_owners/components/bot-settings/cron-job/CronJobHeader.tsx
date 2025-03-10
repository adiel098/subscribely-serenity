
import { Clock } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CronJobStatus } from "@/group_owners/hooks/useCronJobStatus";

type CronJobHeaderProps = {
  status: CronJobStatus;
};

export const CronJobHeader = ({ status }: CronJobHeaderProps) => {
  const { timeLeft, lastCheckTime } = status;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="pb-2">
      <div className="flex items-center space-x-2">
        <Clock className={cn(
          "h-5 w-5 text-purple-600",
          timeLeft === 0 && "animate-ping"
        )} />
        <CardTitle className="text-lg font-semibold text-purple-900">Subscription Manager</CardTitle>
      </div>
      <CardDescription className="text-purple-700 font-medium">
        Next check in: {minutes}:{seconds.toString().padStart(2, '0')}
      </CardDescription>
      {lastCheckTime && (
        <CardDescription className="text-purple-600 text-xs">
          Last check: {lastCheckTime.toLocaleTimeString()}
        </CardDescription>
      )}
    </div>
  );
};
