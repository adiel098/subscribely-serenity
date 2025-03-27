import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSubscriberManagement } from "./useSubscriberManagement";
import { Subscriber } from "./useSubscribers";
import { supabase } from "@/integrations/supabase/client";

export const useSubscriberPageState = (entityId: string) => {
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [subscriberToRemove, setSubscriberToRemove] = useState<Subscriber | null>(null);
  const [subscriberToUnblock, setSubscriberToUnblock] = useState<Subscriber | null>(null);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const { toast } = useToast();

  const {
    subscribers,
    isLoading,
    isUpdating,
    isRemoving,
    refetch,
    handleRemoveSubscriber,
    handleUnblockSubscriber,
    assignPlanToUser,
    removeSubscriber
  } = useSubscriberManagement(entityId || "");

  useEffect(() => {
    return () => {
      setRemoveDialogOpen(false);
      setUnblockDialogOpen(false);
      setEditDialogOpen(false);
      
      setTimeout(() => {
        setSubscriberToRemove(null);
        setSubscriberToUnblock(null);
        setSelectedSubscriber(null);
      }, 500);
    };
  }, []);

  const onRemoveClick = useCallback((subscriber: Subscriber) => {
    setSubscriberToRemove(null);
    setTimeout(() => {
      setSubscriberToRemove(subscriber);
      setRemoveDialogOpen(true);
    }, 50);
  }, []);

  const onUnblockClick = useCallback((subscriber: Subscriber) => {
    setSubscriberToUnblock(null);
    setTimeout(() => {
      setSubscriberToUnblock(subscriber);
      setUnblockDialogOpen(true);
    }, 50);
  }, []);

  const onConfirmRemove = useCallback(async (subscriber: Subscriber) => {
    if (!subscriber || isRemoving) return;
    
    try {
      const { data: botSettings, error: botError } = await supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('community_id', subscriber.community_id)
        .single();
      
      if (botError) {
        console.error('Error fetching bot settings:', botError);
        toast({
          title: "Error",
          description: "Could not retrieve bot settings",
          variant: "destructive"
        });
        return;
      }
      
      let botToken = null;
      if (botSettings?.use_custom_bot && botSettings?.custom_bot_token) {
        botToken = botSettings.custom_bot_token;
      } else {
        const { data: globalSettings, error: globalError } = await supabase
          .from('telegram_global_settings')
          .select('bot_token')
          .single();
          
        if (globalError || !globalSettings?.bot_token) {
          console.error('Error retrieving global bot token:', globalError);
          toast({
            title: "Error",
            description: "Could not retrieve bot token",
            variant: "destructive"
          });
          return;
        }
        
        botToken = globalSettings.bot_token;
      }
      
      if (!botToken) {
        toast({
          title: "Error",
          description: "No bot token available",
          variant: "destructive"
        });
        return;
      }
      
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', subscriber.community_id)
        .single();
        
      if (communityError || !community?.telegram_chat_id) {
        console.error('Error retrieving telegram chat ID:', communityError);
        toast({
          title: "Error",
          description: "Could not retrieve Telegram chat ID",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`Removing subscriber with community_id: ${subscriber.community_id} and telegram_chat_id: ${community.telegram_chat_id}`);
      
      await removeSubscriber(subscriber, botToken);
      await refetch();
    } catch (error) {
      console.error("Error removing subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive"
      });
    } finally {
      setRemoveDialogOpen(false);
      
      setTimeout(() => {
        setSubscriberToRemove(null);
      }, 500);
    }
  }, [removeSubscriber, toast, refetch, isRemoving]);

  const handleRemoveDialogChange = useCallback((open: boolean) => {
    if (isRemoving && open === false) {
      return;
    }
    
    setRemoveDialogOpen(open);
    
    if (!open) {
      setTimeout(() => {
        setSubscriberToRemove(null);
      }, 500);
    }
  }, [isRemoving]);

  const handleUnblockDialogChange = useCallback((open: boolean) => {
    if (isUnblocking && open === false) {
      return;
    }
    
    setUnblockDialogOpen(open);
    
    if (!open) {
      setTimeout(() => {
        setSubscriberToUnblock(null);
      }, 500);
    }
  }, [isUnblocking]);

  const onConfirmUnblock = useCallback(async (subscriber: Subscriber) => {
    if (!subscriber || isUnblocking) return;
    
    setIsUnblocking(true);
    try {
      await handleUnblockSubscriber(subscriber);
      toast({
        title: "Success",
        description: "Subscriber unblocked successfully"
      });
      
      await refetch();
    } catch (error) {
      console.error("Error unblocking subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to unblock subscriber",
        variant: "destructive"
      });
    } finally {
      setIsUnblocking(false);
      setUnblockDialogOpen(false);
      
      setTimeout(() => {
        setSubscriberToUnblock(null);
      }, 500);
    }
  }, [handleUnblockSubscriber, toast, refetch, isUnblocking]);

  return {
    subscribers,
    isLoading,
    isUpdating,
    refetch,
    selectedSubscriber,
    setSelectedSubscriber,
    editDialogOpen,
    setEditDialogOpen,
    removeDialogOpen,
    unblockDialogOpen,
    subscriberToRemove,
    subscriberToUnblock,
    isRemoving,
    isUnblocking,
    onRemoveClick,
    onUnblockClick,
    onConfirmRemove,
    onConfirmUnblock,
    handleRemoveDialogChange,
    handleUnblockDialogChange,
    assignPlanToUser
  };
};
