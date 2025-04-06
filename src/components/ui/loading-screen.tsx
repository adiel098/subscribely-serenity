import { Bot, Loader2, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background/90 to-background/95 backdrop-blur-md">
      <div className="fixed left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-6">
          {/* Main Loading Animation */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Loading Membify
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Preparing your community management experience...
            </p>
          </div>

          {/* Floating Icons */}
          <div className="relative h-16 w-48">
            <Bot className={cn(
              "absolute left-0 top-0 h-6 w-6 text-primary/60",
              "animate-float-slow"
            )} />
            <MessageSquare className={cn(
              "absolute left-1/2 top-1/2 h-6 w-6 text-primary/60",
              "animate-float-normal"
            )} />
            <Users className={cn(
              "absolute right-0 bottom-0 h-6 w-6 text-primary/60",
              "animate-float-fast"
            )} />
          </div>
        </div>
      </div>
    </div>
  );
};
