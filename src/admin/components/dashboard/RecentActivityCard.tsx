
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ActivityItem {
  id: number;
  activity: string;
  time: string;
  avatar: string;
}

const recentActivities: ActivityItem[] = [
  { id: 1, activity: "User joined community", time: "1 hour ago", avatar: "U1" },
  { id: 2, activity: "New subscription purchased", time: "2 hours ago", avatar: "U2" },
  { id: 3, activity: "Payment received", time: "3 hours ago", avatar: "U3" },
  { id: 4, activity: "New community created", time: "4 hours ago", avatar: "U4" },
  { id: 5, activity: "User requested support", time: "5 hours ago", avatar: "U5" }
];

export const RecentActivityCard = () => {
  return (
    <Card className="col-span-3 border-blue-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <CardDescription>
          Latest 5 activities in the system 🔔
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {recentActivities.map((item) => (
            <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">{item.avatar}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.activity}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground ml-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
