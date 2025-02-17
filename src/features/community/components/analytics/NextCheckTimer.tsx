import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";

export const NextCheckTimer = () => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();

  useEffect(() => {
    const fetchNextCheckTime = async () => {
      if (!selectedCommunityId) return;

      const { data, error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId: selectedCommunityId,
          path: '/next-check'
        }
      });

      if (error) {
        console.error("Error fetching next check time:", error);
        toast({
          title: "Error",
          description: "Failed to fetch next check time",
          variant: "destructive",
        });
        setTimeRemaining(null);
        return;
      }

      if (data && data.nextCheck) {
        const nextCheckTime = new Date(data.nextCheck).getTime();
        const now = new Date().getTime();
        const timeLeft = Math.max(0, nextCheckTime - now);
        setTimeRemaining(timeLeft);
      } else {
        setTimeRemaining(null);
      }
    };

    fetchNextCheckTime();

    const intervalId = setInterval(() => {
      fetchNextCheckTime();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [selectedCommunityId, toast]);

  const formatTime = (milliseconds: number | null) => {
    if (milliseconds === null) {
      return "Fetching...";
    }

    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Badge className="w-full rounded-md py-3 font-normal text-sm flex items-center justify-center gap-2">
      <Clock className="h-4 w-4 animate-pulse" />
      Next member status check in: {formatTime(timeRemaining)}
      <CheckCheck className="h-4 w-4" />
    </Badge>
  );
};
