import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface LinkEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string | null;
  currentCustomLink: string | null;
  onLinkUpdated: (newLink: string | null) => void;
  entityType?: 'community' | 'group';
}

export const LinkEditDialog = ({ 
  isOpen, 
  onClose, 
  communityId, 
  currentCustomLink, 
  onLinkUpdated,
  entityType = 'community'
}: LinkEditDialogProps) => {
  const [customLink, setCustomLink] = useState(currentCustomLink || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  const baseUrl = "https://t.me/membifybot?start=";

  // Function to validate the custom link format
  const isValidCustomLink = (link: string) => {
    // Allow alphanumeric characters, underscores, and hyphens only
    return /^[a-zA-Z0-9_-]*$/.test(link);
  };

  const handleSaveCustomLink = async () => {
    if (!communityId) return;
    
    try {
      setIsSubmitting(true);
      
      // Check if the custom link is already in use
      if (customLink) {
        const { data, error: checkError } = await supabase
          .from("communities")
          .select("id")
          .eq("custom_link", customLink)
          .neq("id", communityId)
          .single();
          
        if (data) {
          toast({
            title: "Error",
            description: "This custom link is already in use. Please choose another one.",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Update the custom_link in the database
      const { error } = await supabase
        .from("communities")
        .update({ custom_link: customLink || null })
        .eq("id", communityId);
        
      if (error) {
        console.error("Error updating custom link:", error);
        toast({
          title: "Error",
          description: "Failed to update custom link",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Custom link updated successfully"
      });
      
      onLinkUpdated(customLink || null);
      onClose();
      
    } catch (error) {
      console.error("Error in handleSaveCustomLink:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the custom link",
        variant: "destructive"
      });
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
            Create a custom link for your {entityType} that users can use to join.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customLink">Custom Link Identifier</Label>
            <Input
              id="customLink"
              placeholder={`e.g. my-awesome-${entityType}`}
              value={customLink}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidCustomLink(value)) {
                  setCustomLink(value);
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Only alphanumeric characters, underscores, and hyphens are allowed. Leave empty to use the {entityType} ID.
            </p>
          </div>
          
          <div className="pt-2">
            <Label>Preview</Label>
            <div className="mt-1 text-sm bg-muted p-2 rounded break-all">
              {baseUrl}{customLink || communityId || ""}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveCustomLink} 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
