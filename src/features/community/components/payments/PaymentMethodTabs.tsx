
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface PaymentMethodTabsProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const PaymentMethodTabs = ({ children, activeTab = "telegram", onTabChange }: PaymentMethodTabsProps) => {
  return (
    <Tabs defaultValue={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="telegram">Telegram</TabsTrigger>
        <TabsTrigger value="other">Other Methods</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};
