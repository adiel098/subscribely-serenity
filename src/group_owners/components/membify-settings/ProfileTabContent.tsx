
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Pencil, Save, User, Mail, Phone, Shield, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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
    <Card className="max-w-3xl mx-auto shadow-md border border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-full">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-indigo-700">
                Personal Information ✨
              </CardTitle>
              <CardDescription className="text-indigo-500">
                Manage your profile details
              </CardDescription>
            </div>
          </div>
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 border-indigo-200 hover:bg-indigo-100 text-indigo-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 border-indigo-200 hover:bg-indigo-100 text-indigo-700"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-5 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="flex items-center gap-1.5 text-indigo-700">
                <User className="h-3.5 w-3.5" />
                First Name 👤
              </Label>
              <Input 
                id="first_name"
                name="first_name"
                value={profileData.first_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`${!isEditing ? "bg-gray-50" : ""} w-full border-indigo-200 focus-visible:ring-indigo-400`}
                placeholder="Your first name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name" className="flex items-center gap-1.5 text-indigo-700">
                <User className="h-3.5 w-3.5" />
                Last Name 👤
              </Label>
              <Input 
                id="last_name"
                name="last_name"
                value={profileData.last_name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`${!isEditing ? "bg-gray-50" : ""} w-full border-indigo-200 focus-visible:ring-indigo-400`}
                placeholder="Your last name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-indigo-700">
                <Mail className="h-3.5 w-3.5" />
                Email Address ✉️
              </Label>
              <div className="relative">
                <Input 
                  id="email"
                  type="email"
                  name="email"
                  value={profileData.email}
                  disabled={true}
                  className="bg-gray-50 pr-9 w-full border-indigo-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Shield className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <p className="text-xs text-indigo-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Your email is managed by your authentication provider
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5 text-indigo-700">
                <Phone className="h-3.5 w-3.5" />
                Phone Number 📱
              </Label>
              <Input 
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`${!isEditing ? "bg-gray-50" : ""} w-full border-indigo-200 focus-visible:ring-indigo-400`}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {isEditing && (
              <motion.div 
                className="pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
