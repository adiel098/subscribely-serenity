
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB");
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
   * Ensures proper base64 padding and format
   */
  const preprocessImageForTelegram = (imageData: string): string => {
    // For base64 data URLs, ensure the padding is correct
    if (imageData.startsWith('data:')) {
      try {
        // Get the MIME type and base64 data
        const [prefix, base64Data] = imageData.split(',');
        
        // Check if the data length is valid for base64 (multiple of 4)
        if (base64Data.length % 4 !== 0) {
          // Fix padding if needed (add trailing = characters)
          const paddedData = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
          // Reconstruct with correct padding
          return `${prefix},${paddedData}`;
        }
      } catch (e) {
        console.error("Error preprocessing image:", e);
      }
    }
    
    // Return original if no processing needed or on error
    return imageData;
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
