
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadSectionProps {
  image: string | null;
  setImage: (image: string | null) => void;
  updateSettings: any;
  settingsKey?: string;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  imageError: string | null;
  setImageError: (error: string | null) => void;
  label?: string;
}

export const ImageUploadSection = ({
  image,
  setImage,
  updateSettings,
  settingsKey = "welcome_image",
  isUploading,
  setIsUploading,
  imageError,
  setImageError,
  label = "Upload Image"
}: ImageUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImageError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError("Please upload an image file (JPEG, PNG, etc.)");
      setIsUploading(false);
      return;
    }

    // Validate file size (max 1MB for Telegram compatibility)
    if (file.size > 1 * 1024 * 1024) {
      setImageError("Image size should be less than 1MB for Telegram compatibility");
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // For additional reliability, create an image to verify the data loads
      const img = new Image();
      img.onload = () => {
        try {
          // Resize and optimize the image for Telegram
          const optimizedImage = optimizeImageForTelegram(img);
          
          // Set the optimized image
          setImage(optimizedImage);
          
          // Save image immediately after upload
          const updateObj: any = {};
          updateObj[settingsKey] = optimizedImage;
          updateSettings.mutate(updateObj);
          
          console.log(`Image uploaded and optimized for ${settingsKey}`);
          toast.success(`${label} uploaded and optimized for Telegram`);
          setIsUploading(false);
        } catch (error) {
          console.error("Error processing image:", error);
          setImageError("Error processing the image data");
          setIsUploading(false);
        }
      };
      
      img.onerror = () => {
        setImageError("The selected file could not be loaded as an image");
        setIsUploading(false);
      };
      
      img.src = result;
    };
    
    reader.onerror = () => {
      setImageError("Error reading the image file");
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  /**
   * Optimize and resize image for Telegram compatibility
   */
  const optimizeImageForTelegram = (img: HTMLImageElement): string => {
    // Create a canvas for image manipulation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }
    
    // Calculate new dimensions (max width/height 1280px for Telegram)
    const MAX_SIZE = 1280;
    let width = img.width;
    let height = img.height;
    
    if (width > height && width > MAX_SIZE) {
      height = (height * MAX_SIZE) / width;
      width = MAX_SIZE;
    } else if (height > MAX_SIZE) {
      width = (width * MAX_SIZE) / height;
      height = MAX_SIZE;
    }
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Draw image onto canvas with new dimensions
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convert to JPEG format (more compatible with Telegram)
    // Use quality 0.8 (80%) for a good balance between size and quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Ensure the base64 data is properly padded
    return ensureBase64Padding(dataUrl);
  };

  /**
   * Ensure base64 data is properly padded for Telegram API
   */
  const ensureBase64Padding = (dataUrl: string): string => {
    try {
      // Extract base64 data
      const parts = dataUrl.split(',');
      if (parts.length !== 2) return dataUrl;
      
      const prefix = parts[0];
      let base64Data = parts[1];
      
      // Ensure padding is correct (must be divisible by 4)
      const paddingNeeded = (4 - (base64Data.length % 4)) % 4;
      if (paddingNeeded > 0) {
        base64Data += '='.repeat(paddingNeeded);
      }
      
      return `${prefix},${base64Data}`;
    } catch (e) {
      console.error("Error ensuring base64 padding:", e);
      return dataUrl;
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setImage(null);
    const updateObj: any = {};
    updateObj[settingsKey] = null;
    updateSettings.mutate(updateObj);
    toast.success(`${label} removed`);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {imageError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{imageError}</AlertDescription>
        </Alert>
      )}
      
      {image && (
        <div className="relative flex justify-center bg-gray-100 p-2 rounded-md border">
          <img
            src={image}
            alt={label}
            className="max-h-32 object-contain rounded-md"
            style={{ maxWidth: "100%" }}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full bg-red-500 hover:bg-red-600"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          {isUploading 
            ? "Uploading..." 
            : image 
              ? `Change ${label}` 
              : label
          }
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};
