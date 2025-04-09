
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

export interface SubscribersTableProps {
  subscribers: any[];
}

export const SubscribersTable: React.FC<SubscribersTableProps> = ({
  subscribers
}) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[250px]">User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Subscription Ends</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.map((subscriber) => (
            <TableRow key={subscriber.id || subscriber.telegram_user_id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {subscriber.telegram_username || "No username"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {subscriber.telegram_user_id}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {subscriber.subscription_status ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>
                )}
              </TableCell>
              <TableCell>
                {subscriber.plan?.name || "No plan"}
              </TableCell>
              <TableCell>
                {subscriber.joined_at ? format(new Date(subscriber.joined_at), 'MMM d, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {subscriber.subscription_end_date 
                  ? format(new Date(subscriber.subscription_end_date), 'MMM d, yyyy') 
                  : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
