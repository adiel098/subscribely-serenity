
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeaderSection } from "./ProfileHeaderSection";
import { ProfileForm } from "./ProfileForm";

interface ProfileTabContentProps {
  profileData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  setProfileData: React.Dispatch<React.SetStateAction<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }>>;
  isLoading: boolean;
  userId: string | undefined;
}

export const ProfileTabContent = ({ 
  profileData,
  setProfileData,
  isLoading,
  userId
}: ProfileTabContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone
        })
        .eq('id', userId);

      if (error) {
        toast.error("Error saving profile", {
          description: error.message
        });
      } else {
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully"
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Error saving profile", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full shadow-md border border-indigo-100">
      <ProfileHeaderSection 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
      />
      <CardContent className="space-y-6 pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <ProfileForm 
            profileData={profileData}
            handleInputChange={handleInputChange}
            isEditing={isEditing}
            isSaving={isSaving}
            handleSaveProfile={handleSaveProfile}
          />
        )}
      </CardContent>
    </Card>
  );
};
