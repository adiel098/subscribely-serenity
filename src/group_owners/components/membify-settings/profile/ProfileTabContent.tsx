
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeaderSection } from "./ProfileHeaderSection";
import { ProfileForm } from "./ProfileForm";
import { useAuth } from "@/auth/contexts/AuthContext";

export const ProfileTabContent = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // Get data from the users table instead of profiles table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        
        // If there's an error, fallback to user auth data
        setProfileData({
          first_name: '',
          last_name: '',
          email: user?.email || '',
          phone: ''
        });
      } else if (userData) {
        setProfileData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || user?.email || '',
          phone: userData.phone || ''
        });
      }
    } catch (error) {
      console.error('Error in fetch profile operation:', error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

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
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone
        })
        .eq('id', user?.id);

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
