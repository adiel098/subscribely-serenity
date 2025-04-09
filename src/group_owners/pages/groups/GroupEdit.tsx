import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; 
import { Save, Loader2, Plus, X, Users, ArrowLeft } from "lucide-react"; 
import { useCommunityGroup } from "@/group_owners/hooks/useCommunityGroup";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion"; 
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import GroupDetailsForm from "@/group_owners/components/group-edit/GroupDetailsForm";
import GroupImageUpload from "@/group_owners/components/group-edit/GroupImageUpload";
import GroupCommunitiesSection from "@/group_owners/components/group-edit/GroupCommunitiesSection";
import GroupActionButtons from "@/group_owners/components/group-edit/GroupActionButtons";

interface Community {
  id: string;
  name: string;
  created_at: string;
  is_group?: boolean; 
}

interface Group {
  id: string;
  name: string;
  description?: string;
  custom_link?: string;
  telegram_photo_url?: string;
  owner_id?: string;
  is_group?: boolean;
  created_at?: string;
}

const GroupEdit = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { data: allCommunities, isLoading: isCommunitiesLoading } = useCommunities();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const [availableCommunities, setAvailableCommunities] = useState<Community[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  
  const { 
    data: groupData, 
    isLoading: isGroupLoading, 
    error: groupError,
  } = useCommunityGroup(groupId);

  const updateGroupMutation = useMutation({
    mutationFn: async (updates: Partial<Group>) => {
      if (!groupId) throw new Error("Group ID is missing");
      const { error } = await supabase
        .from('communities')
        .update(updates)
        .eq('id', groupId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['community', groupId]);
    }
  });

  const fetchAvailableCommunities = useCallback(async () => {
    setLoadingCommunities(true);
    try {
      if (allCommunities && allCommunities.length > 0) {
        console.log("Using communities from hook:", allCommunities.length);
        const regularCommunities = allCommunities.filter(community => !community.is_group);
        const sortedCommunities = [...regularCommunities].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        console.log("Filtered regular communities:", regularCommunities.length);
        console.log("Sorted communities:", sortedCommunities);
        setAvailableCommunities(sortedCommunities);
      } 
      else if (user?.id) {
        console.log("Falling back to direct DB query for available communities");
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .eq('is_group', false)
          .eq('owner_id', user.id);
          
        if (error) throw error;
        
        console.log("Fetched communities directly:", data);
        if (data && data.length > 0) {
          const sortedCommunities = [...data].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setAvailableCommunities(sortedCommunities);
        } else {
          console.log("No available communities found for user ID:", user.id);
          setAvailableCommunities([]);
        }
      } else {
        console.error("No user ID available and no communities from hook");
        setAvailableCommunities([]);
        toast.error("Cannot load communities: User not identified.");
      }
    } catch (error) {
      console.error('Error fetching available communities:', error);
      toast.error('Failed to load available communities');
      setAvailableCommunities([]); 
    } finally {
      setLoadingCommunities(false);
    }
  }, [allCommunities, user?.id]);

  const fetchLinkedCommunities = useCallback(async () => {
    if (!groupId) return;
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id')
        .eq('project_id', groupId);
        
      if (error) throw error;
      
      const linkedIds = data ? data.map(comm => comm.id) : [];
      console.log("Fetched linked community IDs:", linkedIds);
      setSelectedCommunities(linkedIds);
      
    } catch (error) {
      console.error("Error fetching linked communities:", error);
      toast.error("Failed to load linked communities.");
    }
  }, [groupId]);

  useEffect(() => {
    console.log("Authentication context user:", user);
    if (!user || !user.id) {
      console.warn("User not available or missing ID in GroupEdit component");
    }
  }, [user]);
  
  useEffect(() => {
    console.log("Communities from hook:", allCommunities);
  }, [allCommunities]);

  useEffect(() => {
    if (allCommunities) {
      fetchAvailableCommunities();
    }
  }, [allCommunities, fetchAvailableCommunities]);

  useEffect(() => {
    if (groupData && !initialDataLoaded) {
      console.log("Populating form with group data:", groupData); 
      console.log("Telegram photo URL from groupData:", groupData.telegram_photo_url); 
      setName(groupData.name || "");
      setDescription(groupData.description || "");
      setCustomLink(groupData.custom_link || "");
      setImageUrl(groupData.telegram_photo_url || null);
      
      fetchLinkedCommunities();
      fetchAvailableCommunities();
      
      setInitialDataLoaded(true);
    }
  }, [groupData, initialDataLoaded, fetchLinkedCommunities, fetchAvailableCommunities]);
  
  const handleCommunitySelect = (communityId: string) => {
    setSelectedCommunities(prev =>
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const handleSave = async () => {
    if (!groupId) {
      toast.error("Group ID is missing.");
      return;
    }
    
    setIsSaving(true);
    try {
      // Save group details
      await updateGroupMutation.mutateAsync({
        name,
        description,
        custom_link: customLink,
        telegram_photo_url: imageUrl,
      });

      // Get currently linked communities
      const { data: existingLinks, error: fetchError } = await supabase
        .from('communities')
        .select('id')
        .eq('project_id', groupId);

      if (fetchError) throw fetchError;
      const existingCommunityIds = existingLinks ? existingLinks.map(c => c.id) : [];

      // Communities to add (set project_id)
      for (const commId of selectedCommunities.filter(id => !existingCommunityIds.includes(id))) {
        const { error: addError } = await supabase
          .from('communities')
          .update({ project_id: groupId })
          .eq('id', commId);

        if (addError) throw addError;
      }

      // Communities to remove (unset project_id)
      for (const commId of existingCommunityIds.filter(id => !selectedCommunities.includes(id))) {
        const { error: removeError } = await supabase
          .from('communities')
          .update({ project_id: null })
          .eq('id', commId);

        if (removeError) throw removeError;
      }

      toast.success("Group updated successfully!");
      
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error('Failed to save group');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadGroupImageMutation = useMutation({
    mutationFn: async ({ file, groupId }: { file: File; groupId: string }) => {
      if (!user || !groupId) throw new Error("User or Group ID is missing");

      // Convert the file to a data URL to get its content
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      // Update telegram_photo_url in the database with the data URL
      const { error: updateError } = await supabase
        .from('communities')
        .update({ telegram_photo_url: dataUrl })
        .eq('id', groupId)
        .eq('owner_id', user.id);

      if (updateError) {
        console.error('Error updating group photo URL:', updateError);
        throw new Error('Failed to update group photo URL.');
      }

      return dataUrl;
    },
    onMutate: () => {
      setIsUploading(true);
    },
    onSuccess: (newImageUrl) => {
      toast.success("✨ Group photo updated successfully!");
      setImageUrl(newImageUrl);
      queryClient.invalidateQueries({ queryKey: ['community-group', groupId] });
    },
    onError: (error) => {
      console.error("Photo update failed:", error);
      toast.error(`Photo update failed: ${error.message}`);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !groupId) return;
    
    try {
      // Use the mutation to upload the image
      await uploadGroupImageMutation.mutateAsync({ file: imageFile, groupId });
      setImageFile(null); // Clear the selected file after successful upload
    } catch (error) {
      // Error handling is now mostly done within the mutation's onError
      console.error("Error initiating image upload:", error); 
      // toast.error is handled in mutation's onError
    }
  };

  const handleRemoveImage = async () => {
    const previousImageUrl = imageUrl;
    setImageUrl(null);
    setImageFile(null);
    
    if (groupId) {
       try {
         await updateGroupMutation.mutateAsync({ telegram_photo_url: null }); 
         toast.success("Image removed.");
       } catch(error) {
         setImageUrl(previousImageUrl);
         console.error("Failed to remove image from database:", error);
         toast.error("Failed to remove image.");
       }
    }
  };

  if (isGroupLoading && !initialDataLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  if (groupError) {
     return (
       <div className="flex justify-center items-center h-screen text-red-600">
         Error loading group data. Please try again.
       </div>
     );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${isMobile ? 'max-w-full' : 'max-w-4xl'}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <GroupDetailsForm 
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              customLink={customLink}
              setCustomLink={setCustomLink}
              isSaving={isSaving}
            />
          </div>
          
          <div>
            <GroupImageUpload 
              imageUrl={imageUrl}
              imageFile={imageFile}
              handleImageChange={handleImageChange}
              handleImageUpload={handleImageUpload}
              handleRemoveImage={handleRemoveImage}
              isUploading={isUploading}
              isSaving={isSaving} 
            />
          </div>
        </div>
          
        <GroupCommunitiesSection 
          availableCommunities={availableCommunities}
          selectedCommunities={selectedCommunities}
          handleCommunitySelect={handleCommunitySelect}
          loadingCommunities={loadingCommunities}
        />

        <GroupActionButtons 
          handleSave={handleSave}
          isSaving={isSaving}
        />
        
      </motion.div>
    </div>
  );
};

export default GroupEdit;
