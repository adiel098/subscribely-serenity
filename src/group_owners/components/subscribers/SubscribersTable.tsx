
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface Subscriber {
  id: string;
  telegram_user_id?: string;
  telegram_username?: string;
  first_name?: string | null;
  last_name?: string | null;
  subscription_status?: string;
  subscription_end_date?: string;
  joined_at?: string;
  is_trial?: boolean;
}

export interface SubscribersTableProps {
  subscribers: Subscriber[];
  isProjectSelected?: boolean;
}

export const SubscribersTable: React.FC<SubscribersTableProps> = ({
  subscribers,
  isProjectSelected = false,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber) => (
            <TableRow key={subscriber.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {subscriber.first_name || "User"} {subscriber.last_name || ""}
                  </span>
                  {subscriber.telegram_username && (
                    <span className="text-xs text-gray-500">@{subscriber.telegram_username}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {subscriber.subscription_status === "active" ? (
                  <Badge variant="success">Active</Badge>
                ) : subscriber.subscription_status === "inactive" ? (
                  <Badge variant="destructive">Inactive</Badge>
                ) : subscriber.is_trial ? (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">Trial</Badge>
                ) : (
                  <Badge variant="secondary">Unknown</Badge>
                )}
              </TableCell>
              <TableCell>
                {subscriber.joined_at
                  ? format(new Date(subscriber.joined_at), "MMM d, yyyy")
                  : "—"}
              </TableCell>
              <TableCell>
                {subscriber.subscription_end_date
                  ? format(new Date(subscriber.subscription_end_date), "MMM d, yyyy")
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
          {subscribers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                No subscribers found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
