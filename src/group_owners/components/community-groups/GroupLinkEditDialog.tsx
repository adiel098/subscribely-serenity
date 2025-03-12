
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GroupLinkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
  currentCustomLink: string | null;
  onLinkUpdated: (newLink: string | null) => void;
}

export const GroupLinkEditDialog = ({ 
  isOpen, 
  onClose, 
  groupId, 
  currentCustomLink, 
  onLinkUpdated 
}: GroupLinkEditDialogProps) => {
  const [customLink, setCustomLink] = useState(currentCustomLink || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseUrl = "https://t.me/membifybot?start=group_";

  // Function to validate the custom link format
  const isValidCustomLink = (link: string) => {
    // Allow alphanumeric characters, underscores, and hyphens only
    return /^[a-zA-Z0-9_-]*$/.test(link);
  };

  const handleSaveCustomLink = async () => {
    if (!groupId) return;
    
    try {
      setIsSubmitting(true);
      
      // Check if the custom link is already in use
      if (customLink) {
        const { data, error: checkError } = await supabase
          .from("communities")
          .select("id")
          .eq("custom_link", customLink)
          .neq("id", groupId)
          .single();
          
        if (data) {
          toast.error("This custom link is already in use. Please choose another one.");
          return;
        }
      }
      
      // Update the custom_link in the database
      const { error } = await supabase
        .from("communities")
        .update({ custom_link: customLink || null })
        .eq("id", groupId);
        
      if (error) {
        console.error("Error updating custom link:", error);
        toast.error("Failed to update custom link");
        return;
      }
      
      toast.success("Custom link updated successfully");
      onLinkUpdated(customLink || null);
      onClose();
      
    } catch (error) {
      console.error("Error in handleSaveCustomLink:", error);
      toast.error("An error occurred while updating the custom link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Custom Link</DialogTitle>
          <DialogDescription>
            Create a custom link for your group that users can use to join.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customLink">Custom Link Identifier</Label>
            <Input
              id="customLink"
              placeholder="e.g. my-awesome-group"
              value={customLink}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidCustomLink(value)) {
                  setCustomLink(value);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Only alphanumeric characters, underscores, and hyphens are allowed. Leave empty to use the group ID.
            </p>
          </div>
          
          <div className="pt-2">
            <Label>Preview</Label>
            <div className="mt-1 text-sm bg-muted p-2 rounded break-all">
              {baseUrl}{customLink || groupId || ""}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCustomLink} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
