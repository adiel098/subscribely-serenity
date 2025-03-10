
import { Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface BotSettingsLayoutProps {
  isLoading: boolean;
  children: ReactNode;
}

export const BotSettingsLayout = ({ isLoading, children }: BotSettingsLayoutProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center space-x-2">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Bot Settings</h1>
          <p className="text-sm text-muted-foreground">
            Customize your bot's behavior and automated messages
          </p>
        </div>
      </div>
      {children}
    </div>
  );
};
