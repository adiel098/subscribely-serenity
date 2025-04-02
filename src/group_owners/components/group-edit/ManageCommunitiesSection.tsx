import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Users, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

// Define community type locally or import if available globally
interface Community {
  id: string;
  name: string;
  created_at: string;
  // Add other relevant fields if necessary
}

interface ManageCommunitiesSectionProps {
  communitiesDialogOpen: boolean;
  setCommunitiesDialogOpen: (open: boolean) => void;
  handleOpenCommunitiesDialog: () => void;
  loadingCommunities: boolean;
  availableCommunities: Community[];
  selectedCommunities: string[];
  handleCommunitySelect: (communityId: string) => void;
  handleSaveCommunities: () => void;
  isSavingCommunities: boolean;
  user: { id?: string } | null; // Simplified user type for context
}

const ManageCommunitiesSection: React.FC<ManageCommunitiesSectionProps> = ({
  communitiesDialogOpen,
  setCommunitiesDialogOpen,
  handleOpenCommunitiesDialog,
  loadingCommunities,
  availableCommunities,
  selectedCommunities,
  handleCommunitySelect,
  handleSaveCommunities,
  isSavingCommunities,
  user
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-indigo-700">Manage Communities</CardTitle>
          <CardDescription>Link existing communities to this group.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenCommunitiesDialog}
            className="w-full justify-center border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Communities
          </Button>
        </CardContent>
      </Card>

      {/* Communities Selection Dialog */}
      <Dialog open={communitiesDialogOpen} onOpenChange={setCommunitiesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-700">
              <Users className="h-5 w-5" />
              <span>Manage Group Communities</span>
            </DialogTitle>
            <DialogDescription>
              Select communities to include in this group. Users with access to the group will have access to all selected communities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loadingCommunities ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              </div>
            ) : !availableCommunities || availableCommunities.length === 0 ? (
              <div>
                <p className="text-center text-muted-foreground py-8">
                  No communities available to select
                </p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify({
                    user_id: user?.id,
                    communities_count: availableCommunities?.length || 0
                  }, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                  <p className="text-sm font-medium text-indigo-700">
                    Selected: <span className="px-1.5 py-0.5 bg-indigo-100 rounded-full text-xs">{selectedCommunities.length}</span>
                  </p>
                  <p className="text-xs text-gray-500">Total: {availableCommunities.length}</p>
                  {selectedCommunities.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                      onClick={() => {/* Need to pass setSelectedCommunities or a clear function */}}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {availableCommunities.map((community) => (
                      <div 
                        key={community.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-indigo-50 transition-colors cursor-pointer"
                        onClick={() => handleCommunitySelect(community.id)}
                      >
                        <label 
                          htmlFor={`community-${community.id}`} 
                          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer mr-2"
                        >
                          {community.name}
                        </label>
                        <Checkbox
                          id={`community-${community.id}`}
                          checked={selectedCommunities.includes(community.id)}
                          onCheckedChange={() => handleCommunitySelect(community.id)}
                          className="border-indigo-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setCommunitiesDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSaveCommunities}
              disabled={isSavingCommunities}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-600 flex items-center gap-2"
            >
              {isSavingCommunities ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4" />}
              <span>Save Communities</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ManageCommunitiesSection;
