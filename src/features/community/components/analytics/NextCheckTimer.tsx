import { useEffect, useState } from "react";
import { Card, CardContent } from "@/features/community/components/ui/card";
import { Timer } from "lucide-react";
import { format, addMinutes, differenceInSeconds } from "date-fns";

export const NextCheckTimer = () => {
  const [nextCronTime, setNextCronTime] = useState<Date | null>(null);
  const [timeUntilNextCron, setTimeUntilNextCron] = useState<string>("");

  useEffect(() => {
    const calculateNextCron = () => {
      const now = new Date();
      const next = addMinutes(now, 60 - now.getMinutes());
      next.setSeconds(0);
      next.setMilliseconds(0);
      setNextCronTime(next);
    };

    calculateNextCron();
    const interval = setInterval(calculateNextCron, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!nextCronTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const diffInSeconds = differenceInSeconds(nextCronTime, now);
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      setTimeUntilNextCron(`${minutes} minutes ${seconds} seconds`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextCronTime]);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-none">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <Timer className="h-8 w-8 text-purple-500" />
          <div>
            <h3 className="text-lg font-semibold">Next Subscription Check</h3>
            <p className="text-sm text-gray-500">
              {nextCronTime ? (
                <>
                  in {timeUntilNextCron} ({format(nextCronTime, 'HH:mm:ss')})
                </>
              ) : (
                'Loading...'
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
