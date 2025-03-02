
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const CronJobTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMinute = new Date(now);
      nextMinute.setMinutes(now.getMinutes() + 1);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);
      
      const newTimeLeft = Math.max(0, Math.floor((nextMinute.getTime() - now.getTime()) / 1000));
      
      // If we've reached a new minute, update the last check time
      if (timeLeft === 0) {
        setLastCheck(new Date());
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
        <CardDescription className="text-purple-600 text-xs">
          Last check: {lastCheck.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-purple-700">
          Automatically manages subscriptions by checking member status, removing expired members, and sending renewal notifications every minute.
        </p>
      </CardContent>
    </Card>
  );
};
