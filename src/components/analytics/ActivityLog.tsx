
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Clock, Bell, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  event_type: string;
  created_at: string;
  amount?: number;
}

interface ActivityLogProps {
  events: Event[];
}

export const ActivityLog = ({ events }: ActivityLogProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events?.slice(0, 10).map(event => (
            <div key={event.id} className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-gray-100">
                {event.event_type === 'payment_received' && <CreditCard className="h-4 w-4 text-green-500" />}
                {event.event_type === 'subscription_expired' && <Clock className="h-4 w-4 text-red-500" />}
                {event.event_type === 'notification_sent' && <Bell className="h-4 w-4 text-yellow-500" />}
                {event.event_type === 'member_joined' && <Users className="h-4 w-4 text-blue-500" />}
                {event.event_type === 'subscription_renewed' && <TrendingUp className="h-4 w-4 text-purple-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {event.event_type === 'payment_received' && 'Payment Received'}
                  {event.event_type === 'subscription_expired' && 'Subscription Expired'}
                  {event.event_type === 'notification_sent' && 'Notification Sent'}
                  {event.event_type === 'member_joined' && 'New Member Joined'}
                  {event.event_type === 'subscription_renewed' && 'Subscription Renewed'}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              {event.amount && (
                <div className="text-green-500 font-medium">${event.amount}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
