
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, User, UserPlus, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";

interface UnmanagedUsersListProps {
  users: Subscriber[];
  onAssignPlan: (user: Subscriber) => void;
}

export const UnmanagedUsersList = ({ users, onAssignPlan }: UnmanagedUsersListProps) => {
  return (
    <div className="rounded-lg border shadow-sm overflow-hidden bg-white">
      <div className="overflow-auto max-h-[calc(100vh-335px)]">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50 border-b">
              <TableHead className="font-semibold text-xs text-gray-700">User</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Telegram ID</TableHead>
              <TableHead className="font-semibold text-xs text-gray-700">Joined On</TableHead>
              <TableHead className="w-[120px] text-right font-semibold text-xs text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow 
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors border-b"
                >
                  {/* User cell */}
                  <TableCell className="py-3">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {user.telegram_username ? (
                            <a
                              href={`https://t.me/${user.telegram_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                            >
                              @{user.telegram_username}
                              <ExternalLink className="h-3 w-3 ml-1.5 opacity-50" />
                            </a>
                          ) : (
                            "No username"
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {format(new Date(user.joined_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Name cell */}
                  <TableCell className="py-3">
                    <div className="font-medium text-sm text-gray-800">
                      {user.first_name || "-"}
                      {user.first_name && user.last_name && " "}
                      {user.last_name || ""}
                    </div>
                  </TableCell>
                  
                  {/* Telegram ID cell */}
                  <TableCell className="font-mono text-xs py-3 text-gray-600">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">{user.telegram_user_id}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Telegram User ID</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  
                  {/* Joined Date cell */}
                  <TableCell className="py-3 text-left">
                    <div className="text-sm text-gray-700">
                      {format(new Date(user.joined_at), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  
                  {/* Actions cell */}
                  <TableCell className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700"
                      onClick={() => onAssignPlan(user)}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Assign Plan
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <UserPlus className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-lg font-medium mb-2 text-gray-700">No unmanaged users found</p>
                    <p className="text-sm text-gray-500 max-w-md">
                      All Telegram users in your channel currently have subscription plans assigned.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
