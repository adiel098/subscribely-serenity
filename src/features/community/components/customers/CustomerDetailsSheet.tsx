
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/features/community/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/features/community/components/ui/tabs";
import { CustomerProfile } from "./CustomerProfile";
import { CustomerCommunities } from "./CustomerCommunities";
import { CustomerSubscriptions } from "./CustomerSubscriptions";

interface CustomerData {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  telegram_username: string | null;
}

interface CustomerDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerData | null;
}

export const CustomerDetailsSheet = ({
  isOpen,
  onClose,
  customer,
}: CustomerDetailsSheetProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (isOpen) {
      setActiveTab("profile");
    }
  }, [isOpen]);

  if (!customer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4">
              <CustomerProfile customer={customer} />
            </TabsContent>
            <TabsContent value="communities" className="mt-4">
              <CustomerCommunities customerId={customer.id} />
            </TabsContent>
            <TabsContent value="subscriptions" className="mt-4">
              <CustomerSubscriptions customerId={customer.id} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
