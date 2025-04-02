import React, { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface GroupImageUploadProps {
  imageUrl: string | null;
  imageFile: File | null;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageUpload: () => void;
  handleRemoveImage: () => void;
  isUploading: boolean;
  isSaving: boolean;
}

const GroupImageUpload: React.FC<GroupImageUploadProps> = ({
  imageUrl, imageFile, handleImageChange, handleImageUpload, handleRemoveImage, 
  isUploading, isSaving
}) => {
  
  // Log 3: Check the received imageUrl prop inside GroupImageUpload
  useEffect(() => {
    console.log("GroupImageUpload received imageUrl:", imageUrl);
  }, [imageUrl]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-indigo-700">Group Image</CardTitle>
          <CardDescription>Upload a profile image for your group.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32 border-4 border-indigo-100 shadow-md">
            <AvatarImage src={imageFile ? URL.createObjectURL(imageFile) : imageUrl || undefined} alt="Group Image" />
            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-semibold text-4xl">
              {/* Display initials or a placeholder icon if needed */}
              G
            </AvatarFallback>
          </Avatar>
          
          <input 
            type="file" 
            id="imageUpload" 
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
            disabled={isUploading || isSaving}
          />
          
          <div className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => document.getElementById('imageUpload')?.click()} 
              disabled={isUploading || isSaving}
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              Choose Image
            </Button>
            
            {imageFile && (
              <Button 
                type="button" 
                onClick={handleImageUpload} 
                disabled={isUploading || isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
            )}
            
            {(imageUrl || imageFile) && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={handleRemoveImage}
                disabled={isUploading || isSaving}
                className="text-red-500 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {imageFile && (
            <p className="text-xs text-gray-500 truncate max-w-[200px]">Selected: {imageFile.name}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GroupImageUpload;
