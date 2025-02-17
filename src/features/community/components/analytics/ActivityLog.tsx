import { formatDistanceToNow } from 'date-fns';
import { Event } from "@/pages/Analytics";

interface ActivityLogProps {
  events: Event[];
}

export const ActivityLog = ({ events }: ActivityLogProps) => {
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
      <ul className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="border-b pb-3 last:border-b-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{event.event_type}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(event.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {event.amount && (
                <div className="text-green-600 font-semibold">
                  + ${event.amount}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
