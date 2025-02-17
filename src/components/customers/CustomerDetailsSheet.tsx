
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerProfile } from "./CustomerProfile";
import { CustomerCommunities } from "./CustomerCommunities";
import { CustomerSubscriptions } from "./CustomerSubscriptions";
import { Loader2 } from "lucide-react";

interface CustomerDetailsSheetProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsSheet = ({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsSheetProps) => {
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          communities (
            id,
            name,
            platform,
            member_count,
            subscription_count,
            subscription_revenue,
            platform_id,
            telegram_chat_id,
            telegram_invite_link
          )
        `)
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(customerId),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
          </div>
        ) : customer ? (
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="communities">Communities</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <CustomerProfile customer={customer} />
            </TabsContent>
            <TabsContent value="communities">
              <CustomerCommunities communities={customer.communities || []} />
            </TabsContent>
            <TabsContent value="subscriptions">
              <CustomerSubscriptions communities={customer.communities || []} />
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
