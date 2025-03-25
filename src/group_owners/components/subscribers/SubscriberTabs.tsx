
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscribersTable } from "./SubscribersTable";
import { UnmanagedUsersList } from "./UnmanagedUsersList";
import { MobileSubscribersList } from "./MobileSubscribersList";
import { MobileUnmanagedUsersList } from "./MobileUnmanagedUsersList";
import { useIsMobile } from "@/hooks/use-mobile";
import { User, UserPlus } from "lucide-react";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface SubscriberTabsProps {
  subscribers: Subscriber[];
  unmanagedUsers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
  onUnblock: (subscriber: Subscriber) => void;
  onAssignPlan: (user: Subscriber) => void;
}

export const SubscriberTabs: React.FC<SubscriberTabsProps> = ({
  subscribers,
  unmanagedUsers,
  onEdit,
  onRemove,
  onUnblock,
  onAssignPlan
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="subscribers" className="w-full">
      <TabsList className={`grid grid-cols-2 ${isMobile ? 'w-full text-xs h-9' : 'w-[400px]'}`}>
        <TabsTrigger value="subscribers" className="flex items-center gap-1.5">
          <User className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span>Subscribers</span>
          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} ml-1 bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5`}>
            {subscribers.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="unmanaged" className="flex items-center gap-1.5">
          <UserPlus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <span>Unmanaged</span>
          <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} ml-1 bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5`}>
            {unmanagedUsers.length}
          </span>
        </TabsTrigger>
      </TabsList>
      <div className="mt-4">
        <TabsContent value="subscribers">
          {isMobile ? (
            <MobileSubscribersList 
              subscribers={subscribers}
              onEdit={onEdit}
              onRemove={onRemove}
              onUnblock={onUnblock}
            />
          ) : (
            <SubscribersTable 
              subscribers={subscribers}
              onEdit={onEdit}
              onRemove={onRemove}
              onUnblock={onUnblock}
            />
          )}
        </TabsContent>
        
        <TabsContent value="unmanaged">
          {isMobile ? (
            <MobileUnmanagedUsersList
              users={unmanagedUsers}
              onAssignPlan={onAssignPlan}
            />
          ) : (
            <UnmanagedUsersList
              users={unmanagedUsers}
              onAssignPlan={onAssignPlan}
            />
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
};
