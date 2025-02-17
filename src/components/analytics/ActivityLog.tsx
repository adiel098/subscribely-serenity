
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Clock, Bell, Users, TrendingUp, DoorClosed, LogIn } from "lucide-react";
import { format } from "date-fns";

interface Event {
  id: string;
  event_type: string;
  created_at: string;
  amount?: number;
  metadata?: Record<string, any>;
}

interface ActivityLogProps {
  events: Event[];
}

export const ActivityLog = ({ events }: ActivityLogProps) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'payment_received':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'subscription_expired':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'notification_sent':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'member_joined':
        return <LogIn className="h-4 w-4 text-blue-500" />;
      case 'member_left':
        return <DoorClosed className="h-4 w-4 text-red-500" />;
      case 'subscription_renewed':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTitle = (eventType: string) => {
    switch (eventType) {
      case 'payment_received':
        return 'Payment Received';
      case 'subscription_expired':
        return 'Subscription Expired';
      case 'notification_sent':
        return 'Notification Sent';
      case 'member_joined':
        return 'New Member Joined';
      case 'member_left':
        return 'Member Left';
      case 'subscription_renewed':
        return 'Subscription Renewed';
      default:
        return eventType;
    }
  };

  const getEventDetails = (event: Event) => {
    if (event.metadata) {
      switch (event.event_type) {
        case 'notification_sent':
          return `Sent to ${event.metadata.total_recipients} members (${event.metadata.success_count} successful)`;
        case 'member_joined':
        case 'member_left':
          return event.metadata.username ? `@${event.metadata.username}` : 'Anonymous user';
        default:
          return '';
      }
    }
    return '';
  };

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
                {getEventIcon(event.event_type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {getEventTitle(event.event_type)}
                </p>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-gray-500">
                    {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                  {getEventDetails(event) && (
                    <p className="text-xs text-gray-600">{getEventDetails(event)}</p>
                  )}
                </div>
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
