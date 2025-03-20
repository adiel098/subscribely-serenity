
import React from "react";
import { User, Mail, Phone, Shield, CheckCircle2 } from "lucide-react";
import { ProfileField } from "./ProfileField";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface ProfileFormProps {
  profileData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
  isSaving: boolean;
  handleSaveProfile: () => Promise<void>;
}

export const ProfileForm = ({
  profileData,
  handleInputChange,
  isEditing,
  isSaving,
  handleSaveProfile
}: ProfileFormProps) => {
  return (
    <div className="space-y-5 max-w-md mx-auto">
      <ProfileField 
        id="first_name"
        name="first_name"
        label="First Name"
        value={profileData.first_name}
        onChange={handleInputChange}
        disabled={!isEditing}
        icon={User}
        emoji="👤"
        placeholder="Your first name"
      />
      
      <ProfileField 
        id="last_name"
        name="last_name"
        label="Last Name"
        value={profileData.last_name}
        onChange={handleInputChange}
        disabled={!isEditing}
        icon={User}
        emoji="👤"
        placeholder="Your last name"
      />

      <ProfileField 
        id="email"
        name="email"
        label="Email Address"
        value={profileData.email}
        disabled={true}
        icon={Mail}
        emoji="✉️"
        rightIcon={<Shield className="h-4 w-4 text-indigo-400" />}
        helperText={
          <>
            <CheckCircle2 className="h-3 w-3" />
            Your email is managed by your authentication provider
          </>
        }
      />

      <ProfileField 
        id="phone"
        name="phone"
        label="Phone Number"
        value={profileData.phone}
        onChange={handleInputChange}
        disabled={!isEditing}
        icon={Phone}
        emoji="📱"
        placeholder="Enter phone number"
      />

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
  );
};
