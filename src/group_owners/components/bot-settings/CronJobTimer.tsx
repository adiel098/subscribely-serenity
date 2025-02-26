
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

const CRON_INTERVAL_MINUTES = 1;

export const CronJobTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number>(CRON_INTERVAL_MINUTES * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          return CRON_INTERVAL_MINUTES * 60;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <Card className="animate-fade-in bg-purple-100/70 border-purple-200">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg font-semibold text-purple-900">Subscription Manager</CardTitle>
        </div>
        <CardDescription className="text-purple-700 font-medium">
          Next check in: {minutes}:{seconds.toString().padStart(2, '0')}
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
