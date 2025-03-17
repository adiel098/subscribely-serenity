
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";

interface GroupPropertyEditSectionProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  photoUrl: string;
  setPhotoUrl: (photoUrl: string) => void;
}

export const GroupPropertyEditSection: React.FC<GroupPropertyEditSectionProps> = ({
  name,
  setName,
  description,
  setDescription,
  photoUrl,
  setPhotoUrl
}) => {
  // For future implementation of file upload
  const handlePhotoUpload = () => {
    // Placeholder for the actual upload functionality
    alert("Photo upload functionality coming soon!");
  };

  return (
    <div className="space-y-4">
      {/* Group Photo */}
      <div className="space-y-2">
        <Label htmlFor="photo">Group Photo</Label>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 rounded-md overflow-hidden h-16 w-16 bg-gray-100 border border-gray-200 flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt="Group" className="h-full w-full object-cover" />
            ) : (
              <Image className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Input
              id="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Enter photo URL"
              className="mb-2"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="text-xs gap-1"
              onClick={handlePhotoUpload}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Photo
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          You can enter a URL to an existing image or upload a new one (coming soon)
        </p>
      </div>

      {/* Group Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Group Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter group name"
          className="w-full"
          required
        />
      </div>

      {/* Group Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description for this group of communities"
          rows={4}
          className="resize-none w-full"
        />
      </div>
    </div>
  );
};
