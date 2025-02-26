
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, RefreshCw, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const CRON_INTERVAL_MINUTES = 1; // Cron job runs every minute

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
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Automated Subscription Management</CardTitle>
        </div>
        <CardDescription>
          Next check in: {minutes}:{seconds.toString().padStart(2, '0')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <RefreshCw className="h-5 w-5 text-primary mt-1" />
            <div>
              <h4 className="font-medium">Automatic Checks</h4>
              <p className="text-sm text-muted-foreground">
                The system automatically checks subscription statuses every minute to manage member access and send notifications.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-primary mt-1" />
            <div>
              <h4 className="font-medium">Automated Actions</h4>
              <ul className="text-sm text-muted-foreground list-disc ml-4 space-y-1">
                <li>Sends subscription expiration reminders</li>
                <li>Removes expired members (if enabled)</li>
                <li>Updates membership status</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
