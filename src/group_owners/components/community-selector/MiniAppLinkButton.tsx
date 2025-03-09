
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Community } from "@/group_owners/hooks/useCommunities";

interface MiniAppLinkButtonProps {
  onClick: () => void;
  community?: Community;
}

export const MiniAppLinkButton = ({ onClick, community }: MiniAppLinkButtonProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customLink, setCustomLink] = useState(community?.custom_link || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseUrl = "https://t.me/SubscribelyBot?start=";
  const fullLink = community?.custom_link 
    ? `${baseUrl}${community.custom_link}` 
    : community?.id 
      ? `${baseUrl}${community.id}` 
      : "";

  const handleSaveCustomLink = async () => {
    if (!community?.id) return;
    
    try {
      setIsSubmitting(true);
      
      // Check if the custom link is already in use
      if (customLink) {
        const { data, error: checkError } = await supabase
          .from("communities")
          .select("id")
          .eq("custom_link", customLink)
          .neq("id", community.id)
          .single();
          
        if (data) {
          toast.error("This custom link is already in use. Please choose another one.");
          return;
        }
      }
      
      // Update the custom_link in the database
      const { error } = await supabase
        .from("communities")
        .update({ custom_link: customLink })
        .eq("id", community.id);
        
      if (error) {
        console.error("Error updating custom link:", error);
        toast.error("Failed to update custom link");
        return;
      }
      
      toast.success("Custom link updated successfully");
      setIsEditDialogOpen(false);
      
    } catch (error) {
      console.error("Error in handleSaveCustomLink:", error);
      toast.error("An error occurred while updating the custom link");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to validate the custom link format
  const isValidCustomLink = (link: string) => {
    // Allow alphanumeric characters, underscores, and hyphens only
    return /^[a-zA-Z0-9_-]+$/.test(link) || link === "";
  };

  return (
    <>
      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center space-x-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1"
          >
            <Button 
              onClick={onClick} 
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8 font-medium w-full"
            >
              <Copy className="h-3.5 w-3.5" />
              העתק קישור למיני אפ
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setIsEditDialogOpen(true)} 
              size="sm"
              variant="outline"
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-8"
            >
              <Edit2 className="h-3.5 w-3.5" />
              ערוך
            </Button>
          </motion.div>
        </div>
        
        {fullLink && (
          <div className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded border break-all">
            {fullLink}
          </div>
        )}
      </div>

      {/* Edit Custom Link Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Custom Link</DialogTitle>
            <DialogDescription>
              Create a custom link for your community that users can use to join.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customLink">Custom Link Identifier</Label>
              <Input
                id="customLink"
                placeholder="e.g. my-awesome-community"
                value={customLink}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isValidCustomLink(value)) {
                    setCustomLink(value);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                Only alphanumeric characters, underscores, and hyphens are allowed. Leave empty to use the community ID.
              </p>
            </div>
            
            <div className="pt-2">
              <Label>Preview</Label>
              <div className="mt-1 text-sm bg-muted p-2 rounded break-all">
                {baseUrl}{customLink || community?.id || ""}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
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
    </>
  );
};
