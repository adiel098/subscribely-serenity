
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSubscriberManagement } from "./useSubscriberManagement";
import { Subscriber } from "./useSubscribers";

export const useSubscriberPageState = (entityId: string) => {
  const [selectedSubscriber, setSelectedSubscriber] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [subscriberToRemove, setSubscriberToRemove] = useState<Subscriber | null>(null);
  const [subscriberToUnblock, setSubscriberToUnblock] = useState<Subscriber | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const { toast } = useToast();

  const {
    subscribers,
    isLoading,
    isUpdating,
    refetch,
    handleRemoveSubscriber,
    handleUnblockSubscriber,
    assignPlanToUser
  } = useSubscriberManagement(entityId || "");

  useEffect(() => {
    return () => {
      setRemoveDialogOpen(false);
      setUnblockDialogOpen(false);
      setEditDialogOpen(false);
      setIsRemoving(false);
      setIsUnblocking(false);
      
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
    
    setIsRemoving(true);
    try {
      await handleRemoveSubscriber(subscriber);
      toast({
        title: "Success",
        description: "Subscriber removed successfully"
      });
      
      await refetch();
    } catch (error) {
      console.error("Error removing subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to remove subscriber",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(false);
      setRemoveDialogOpen(false);
      
      setTimeout(() => {
        setSubscriberToRemove(null);
      }, 500);
    }
  }, [handleRemoveSubscriber, toast, refetch, isRemoving]);

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
