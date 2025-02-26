
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const CRON_INTERVAL_MINUTES = 1;

export const CronJobTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextMinute = new Date(now);
      nextMinute.setMinutes(now.getMinutes() + 1);
      nextMinute.setSeconds(0);
      nextMinute.setMilliseconds(0);
      
      return Math.max(0, Math.floor((nextMinute.getTime() - now.getTime()) / 1000));
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update timer every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const seconds = timeLeft % 60;

  return (
    <Card className="animate-fade-in bg-purple-100/70 border-purple-200">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg font-semibold text-purple-900">Subscription Manager</CardTitle>
        </div>
        <CardDescription className="text-purple-700 font-medium">
          Next check in: 0:{seconds.toString().padStart(2, '0')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-purple-700">
          Automatically manages subscriptions by checking member status, removing expired members, and sending renewal notifications.
        </p>
      </CardContent>
    </Card>
  );
};
