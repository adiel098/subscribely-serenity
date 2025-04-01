
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

    // Validate file size (max 2MB for Telegram compatibility)
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size should be less than 2MB for Telegram compatibility");
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
          // Process for Telegram compatibility
          const processedImageData = preprocessImageForTelegram(result);
          setImage(processedImageData);
          
          // Save image immediately after upload
          const updateObj: any = {};
          updateObj[settingsKey] = processedImageData;
          updateSettings.mutate(updateObj);
          
          console.log(`Image uploaded for ${settingsKey}`);
          toast.success(`${label} uploaded successfully`);
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
   * Preprocess image data for Telegram compatibility
   * Ensures proper base64 padding and format for Telegram API
   */
  const preprocessImageForTelegram = (imageData: string): string => {
    if (!imageData.startsWith('data:')) {
      return imageData;
    }
    
    try {
      // Split the data URL into MIME type and base64 data
      const [prefix, base64Data] = imageData.split(',');
      
      if (!base64Data) {
        console.error("Invalid data URL format");
        return imageData;
      }
      
      // Remove any whitespace from the base64 string
      const cleanedData = base64Data.replace(/\s/g, '');
      
      // Calculate proper padding (should be divisible by 4)
      const paddingNeeded = (4 - (cleanedData.length % 4)) % 4;
      const paddedData = cleanedData + '='.repeat(paddingNeeded);
      
      // For better Telegram compatibility, make sure image is proper format
      // Convert large images to JPEG if they're not already
      if (prefix.includes('image/png') && imageData.length > 100000) {
        // For very large PNG images, convert to JPEG to reduce size
        return convertToJpeg(imageData);
      }
      
      // Reconstruct with correct padding
      return `${prefix},${paddedData}`;
    } catch (e) {
      console.error("Error preprocessing image:", e);
      return imageData; // Return original on error
    }
  };

  /**
   * Convert image to JPEG format for better Telegram compatibility
   */
  const convertToJpeg = (dataUrl: string): string => {
    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      // Create a synchronous version using a temporary image
      img.src = dataUrl;
      
      // Set canvas dimensions to match image (with max size limits)
      const MAX_SIZE = 1280; // Telegram prefers images <= 1280px
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > MAX_SIZE) {
        height = (height * MAX_SIZE) / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = (width * MAX_SIZE) / height;
        height = MAX_SIZE;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and convert
      const ctx = canvas.getContext('2d');
      if (!ctx) return dataUrl;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Quality between 0.8 and 0.9 is usually good balance of quality vs size
      return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      console.error("Error converting image to JPEG:", e);
      return dataUrl; // Return original on error
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
