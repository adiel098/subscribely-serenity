
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscribersTable } from "./SubscribersTable";
import { MobileSubscribersList } from "./MobileSubscribersList";
import { MobileUnmanagedUsersList } from "./MobileUnmanagedUsersList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

interface SubscriberTabsProps {
  subscribers: Subscriber[];
  unmanagedUsers: Subscriber[];
  onEdit: (subscriber: Subscriber) => void;
  onRemove: (subscriber: Subscriber) => void;
  onUnblock?: (subscriber: Subscriber) => void;
  onAssignPlan: (subscriber: Subscriber) => void;
}

export const SubscriberTabs: React.FC<SubscriberTabsProps> = ({
  subscribers,
  unmanagedUsers,
  onEdit,
  onRemove,
  onUnblock,
  onAssignPlan
}) => {
  const [activeTab, setActiveTab] = useState("subscribers");
  const isMobile = useIsMobile();

  if (!isMobile) {
    // On desktop, just show the table without tabs
    return (
      <SubscribersTable 
        subscribers={subscribers} 
        onEdit={onEdit}
        onRemove={onRemove}
        onUnblock={onUnblock}
        onAssignPlan={onAssignPlan}
      />
    );
  }

  return (
    <Tabs 
      defaultValue="subscribers" 
      value={activeTab}
      onValueChange={setActiveTab}
      className="subscriber-tabs"
    >
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="subscribers" className="text-xs py-1.5">
          Subscribers ({subscribers.length})
        </TabsTrigger>
        <TabsTrigger value="unmanaged" className="text-xs py-1.5">
          Unmanaged ({unmanagedUsers.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="subscribers" className="subscriber-tab-content mt-0 p-0">
        <MobileSubscribersList 
          subscribers={subscribers}
          onEdit={onEdit}
          onRemove={onRemove}
          onUnblock={onUnblock}
          onAssignPlan={onAssignPlan}
        />
      </TabsContent>
      
      <TabsContent value="unmanaged" className="subscriber-tab-content mt-0 p-0">
        <MobileUnmanagedUsersList 
          users={unmanagedUsers}
          onAssignPlan={onAssignPlan}
        />
      </TabsContent>
    </Tabs>
  );
};
