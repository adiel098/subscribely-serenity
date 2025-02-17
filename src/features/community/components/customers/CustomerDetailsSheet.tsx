
import { useState } from "react";
import { UserCircle2, Users2, CreditCard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/features/community/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/features/community/components/ui/tabs";
import { CustomerProfile } from "./CustomerProfile";
import { CustomerCommunities } from "./CustomerCommunities";
import { CustomerSubscriptions } from "./CustomerSubscriptions";

interface CustomerData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  status: "active" | "inactive";
  created_at: string;
  profile_image_url: string | null;
  communities: Array<{
    id: string;
    name: string;
    platform: "telegram" | "discord";
    member_count: number;
    subscription_count: number;
    subscription_revenue: number;
    platform_id: string;
    telegram_chat_id: string;
    telegram_invite_link: string;
  }>;
  subscriptions: Array<{
    id: string;
    plan_name: string;
    status: "active" | "expired" | "cancelled";
    start_date: string;
    end_date: string | null;
    price: number;
    community_name: string;
  }>;
}

interface CustomerDetailsSheetProps {
  customer: CustomerData | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({
  customer,
  isOpen,
  onOpenChange,
}: CustomerDetailsSheetProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  if (!customer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
        </SheetHeader>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="communities" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              Communities
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Subscriptions
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="profile">
              <CustomerProfile data={customer} />
            </TabsContent>
            <TabsContent value="communities">
              <CustomerCommunities data={customer} />
            </TabsContent>
            <TabsContent value="subscriptions">
              <CustomerSubscriptions data={customer} />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
