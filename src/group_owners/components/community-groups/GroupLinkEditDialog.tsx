
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("GroupLinkEditDialog");

interface GroupLinkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  currentCustomLink: string | null;
  onLinkUpdated: (newLink: string | null) => void;
}

export const GroupLinkEditDialog = ({
  isOpen,
  onClose,
  groupId,
  currentCustomLink,
  onLinkUpdated,
}: GroupLinkEditDialogProps) => {
  const [customLink, setCustomLink] = useState(currentCustomLink || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Validate custom link if provided (alphanumeric, underscores, hyphens only)
      if (customLink && !/^[a-zA-Z0-9_-]+$/.test(customLink)) {
        toast.error("Custom link must contain only letters, numbers, underscores, and hyphens");
        return;
      }
      
      // Check if custom link is already in use by another community
      if (customLink) {
        const { data: existingCommunity, error: checkError } = await supabase
          .from("communities")
          .select("id")
          .eq("custom_link", customLink)
          .neq("id", groupId)
          .maybeSingle();

        if (existingCommunity) {
          toast.error("This custom link is already in use by another community or group");
          setIsLoading(false);
          return;
        }
      }
      
      // Submit to Supabase - update the communities table since groups are in this table
      logger.log(`Updating custom link for group ${groupId} to: ${customLink || 'null'}`);
      const { error } = await supabase
        .from("communities")
        .update({ custom_link: customLink || null })
        .eq("id", groupId);
      
      if (error) {
        logger.error("Error updating custom link:", error);
        toast.error(error.message || "Failed to update custom link");
        return;
      }
      
      logger.success("Custom link updated successfully");
      toast.success("Custom link updated successfully");
      onLinkUpdated(customLink || null);
      onClose();
    } catch (err) {
      logger.error("Error in handleSave:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit Group Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="space-y-2">
            <Label htmlFor="customLink">Custom Link Identifier</Label>
            <Input
              id="customLink"
              value={customLink}
              onChange={(e) => setCustomLink(e.target.value)}
              placeholder="e.g. premium_group"
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Leave blank to use the default ID. Custom links make your group easier to share.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
