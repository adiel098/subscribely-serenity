import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Community {
  id: string;
  name: string;
  telegram_photo_url?: string;
  description?: string;
}

interface GroupCommunitiesSectionProps {
  availableCommunities: Community[];
  selectedCommunities: string[];
  handleCommunitySelect: (communityId: string) => void;
  loadingCommunities: boolean;
}

const GroupCommunitiesSection: React.FC<GroupCommunitiesSectionProps> = ({
  availableCommunities,
  selectedCommunities,
  handleCommunitySelect,
  loadingCommunities,
}) => {
  // Split communities into linked and unlinked
  const linkedCommunities = availableCommunities.filter(c => selectedCommunities.includes(c.id));
  const unlinkedCommunities = availableCommunities.filter(c => !selectedCommunities.includes(c.id));

  if (loadingCommunities) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-indigo-700">
          Manage Communities
        </CardTitle>
        <CardDescription>
          Link or unlink communities to this group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Linked Communities Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Linked Communities</h3>
            <div className="rounded-md border">
              <div className="p-4 space-y-4">
                {linkedCommunities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No communities linked yet
                  </p>
                ) : (
                  linkedCommunities.map((community) => (
                    <AnimatePresence key={community.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between space-x-4 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={community.telegram_photo_url} alt={community.name} />
                            <AvatarFallback>{community.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{community.name}</p>
                            {community.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {community.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommunitySelect(community.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          Unlink
                        </Button>
                      </motion.div>
                    </AnimatePresence>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Available Communities Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Available Communities</h3>
            <div className="rounded-md border">
              <div className="p-4 space-y-4">
                {unlinkedCommunities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No available communities to link
                  </p>
                ) : (
                  unlinkedCommunities.map((community) => (
                    <AnimatePresence key={community.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between space-x-4 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={community.telegram_photo_url} alt={community.name} />
                            <AvatarFallback>{community.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{community.name}</p>
                            {community.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                {community.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCommunitySelect(community.id)}
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Link
                        </Button>
                      </motion.div>
                    </AnimatePresence>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCommunitiesSection;
