
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";
import { SubscribersTable } from "./SubscribersTable";
import { UnmanagedUsersList } from "./UnmanagedUsersList";
import { motion } from "framer-motion";
import { Users, UserPlus } from "lucide-react";

interface SubscriberTabsProps {
  subscribers: Subscriber[];
  unmanagedUsers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
  onUnblock: (subscriber: Subscriber) => void;
  onAssignPlan: (subscriber: Subscriber) => void;
}

export const SubscriberTabs = ({
  subscribers,
  unmanagedUsers,
  onEdit,
  onRemove,
  onUnblock,
  onAssignPlan
}: SubscriberTabsProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs defaultValue="subscribers" className="w-full">
        <TabsList className="mb-6 bg-white border rounded-lg p-1 shadow-sm">
          <TabsTrigger 
            value="subscribers" 
            className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md"
          >
            <Users className="h-4 w-4" />
            <span>Subscribers</span>
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
              {subscribers.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="unmanaged" 
            className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-50 data-[state=active]:to-orange-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-sm rounded-md"
          >
            <UserPlus className="h-4 w-4" />
            <span>Unmanaged Users</span>
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600">
              {unmanagedUsers.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscribers" className="mt-0">
          <SubscribersTable 
            subscribers={subscribers}
            onEdit={onEdit}
            onRemove={onRemove}
            onUnblock={onUnblock}
          />
        </TabsContent>
        
        <TabsContent value="unmanaged" className="mt-0">
          <UnmanagedUsersList 
            users={unmanagedUsers}
            onAssignPlan={onAssignPlan}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
