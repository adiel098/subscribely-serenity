
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderSectionProps {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ProfileHeaderSection = ({ isEditing, setIsEditing }: ProfileHeaderSectionProps) => {
  return (
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
  );
};
