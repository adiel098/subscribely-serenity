
import React from 'react';
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

export interface SubscribersTableProps {
  subscribers: Subscriber[];
  isProjectSelected?: boolean;
  onEdit?: (subscriber: Subscriber) => void;
  onRemove?: (subscriber: Subscriber) => void;
  onUnblock?: (subscriber: Subscriber) => void;
  onAssignPlan?: (subscriber: Subscriber) => void;
}

export const SubscribersTable: React.FC<SubscribersTableProps> = ({
  subscribers,
  isProjectSelected,
  onEdit,
  onRemove,
  onUnblock,
  onAssignPlan
}) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">User</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Plan</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Joined</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subscribers.map((subscriber) => (
            <tr key={subscriber.id} className="bg-white">
              <td className="px-4 py-3 text-sm text-gray-900 flex items-center gap-3">
                {subscriber.first_name} {subscriber.last_name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  subscriber.is_blocked ? "bg-red-100 text-red-800" :
                  subscriber.subscription_status === true || subscriber.subscription_status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {subscriber.is_blocked ? "Blocked" :
                   subscriber.is_trial ? "Trial" :
                   subscriber.subscription_status === true || subscriber.subscription_status === "active" 
                    ? "Active" 
                    : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {subscriber.plan?.name || "No plan"}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {subscriber.joined_at ? new Date(subscriber.joined_at).toLocaleDateString() : "Unknown"}
              </td>
              <td className="px-4 py-3 text-sm text-right">
                <div className="flex gap-2 justify-end">
                  {onEdit && (
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => onEdit(subscriber)}
                    >
                      Edit
                    </button>
                  )}
                  {subscriber.is_blocked && onUnblock && (
                    <button 
                      className="text-green-600 hover:text-green-800"
                      onClick={() => onUnblock(subscriber)}
                    >
                      Unblock
                    </button>
                  )}
                  {!subscriber.is_blocked && onRemove && (
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => onRemove(subscriber)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
