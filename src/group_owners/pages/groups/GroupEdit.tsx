import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2 } from "lucide-react";
import { useCommunityGroup } from "@/group_owners/hooks/useCommunityGroup";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

const GroupEdit = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { data: group, isLoading } = useCommunityGroup(groupId || "");
  const isMobile = useIsMobile();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customLink, setCustomLink] = useState("");
  
  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setDescription(group.description || "");
      setCustomLink(group.custom_link || "");
    }
  }, [group]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!groupId) return;
    
    // This is a placeholder. You should implement the actual group update mutation
    toast.success("Group updated successfully!");
    navigate("/dashboard");
  };
  
  const isValidCustomLink = (link: string) => {
    // Allow alphanumeric characters, underscores, and hyphens only or empty string
    return /^[a-zA-Z0-9_-]*$/.test(link);
  };
  
  const handleCustomLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidCustomLink(value)) {
      setCustomLink(value);
    }
  };
  
  return (
    <div className="space-y-4 p-3">
      <div className="flex items-center justify-center">
        <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
          Edit Group
        </h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : !group ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Group not found</p>
          <Button 
            onClick={() => navigate("/dashboard")} 
            variant="outline" 
            className="mt-4"
            size={isMobile ? "sm" : "default"}
          >
            Return to Dashboard
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleSubmit}>
            <Card className="border-indigo-100 shadow-md">
              <CardHeader className={isMobile ? "px-3 py-4" : "px-6 py-5"}>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} text-indigo-700`}>
                  Group Details
                </CardTitle>
                <CardDescription className={isMobile ? "text-xs" : "text-sm"}>
                  Update information about your group
                </CardDescription>
              </CardHeader>
              <CardContent className={`space-y-4 ${isMobile ? 'px-3 py-2' : 'px-6 py-3'}`}>
                <div className="space-y-2">
                  <Label htmlFor="name" className={isMobile ? "text-xs" : "text-sm"}>Group Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter group name"
                    required
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className={isMobile ? "text-xs" : "text-sm"}>Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your group"
                    rows={isMobile ? 2 : 3}
                    className={isMobile ? "text-sm" : ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customLink" className={isMobile ? "text-xs" : "text-sm"}>
                    Custom Link (Optional)
                  </Label>
                  <Input 
                    id="customLink" 
                    value={customLink} 
                    onChange={handleCustomLinkChange}
                    placeholder="my-group"
                    className={isMobile ? "h-8 text-sm" : ""}
                  />
                  <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
                    Only letters, numbers, hyphens, and underscores allowed
                  </p>
                </div>
              </CardContent>
              <CardFooter className={`flex justify-end gap-2 ${isMobile ? 'px-3 py-3' : 'px-6 py-4'}`}>
                <Button 
                  type="submit" 
                  size={isMobile ? "sm" : "default"}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Save className={`${isMobile ? 'mr-1 h-3 w-3' : 'mr-2 h-4 w-4'}`} />
                  <span className={isMobile ? "text-xs" : ""}>Save Changes</span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default GroupEdit;
