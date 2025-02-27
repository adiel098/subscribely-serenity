
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadSectionProps {
  welcomeImage: string;
  setWelcomeImage: (image: string) => void;
  updateSettings: any;
  isUploading: boolean;
  setIsUploading: (uploading: boolean) => void;
  imageError: string | null;
  setImageError: (error: string | null) => void;
}

export const ImageUploadSection = ({
  welcomeImage,
  setWelcomeImage,
  updateSettings,
  isUploading,
  setIsUploading,
  imageError,
  setImageError,
}: ImageUploadSectionProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to optimize image size for Telegram
  const optimizeImageForTelegram = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          
          // Telegram recommends images not larger than 1280x1280
          let width = img.width;
          let height = img.height;
          
          // If image is larger than 1280px in any dimension, scale it down
          const maxSize = 1280;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = Math.round(height * (maxSize / width));
              width = maxSize;
            } else {
              width = Math.round(width * (maxSize / height));
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw the image on the canvas
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get the data URL, using a high quality JPEG (0.9 quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve(dataUrl);
        };
        
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImageError(null);

    try {
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

      // Optimize image for Telegram
      const optimizedImage = await optimizeImageForTelegram(file);
      
      setWelcomeImage(optimizedImage);
      
      // Save image immediately after upload
      updateSettings.mutate({ 
        welcome_image: optimizedImage
      });
      
      console.log("Image uploaded and optimized for Telegram");
      toast.success("Welcome image uploaded");
    } catch (error) {
      console.error("Error processing image:", error);
      setImageError("Error processing the image. Please try another image.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setWelcomeImage("");
    updateSettings.mutate({ 
      welcome_image: null
    });
    toast.success("Welcome image removed");
    
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
      
      {welcomeImage && (
        <div className="relative">
          <img
            src={welcomeImage}
            alt="Welcome"
            className="w-full h-48 object-cover rounded-md border"
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
            : welcomeImage 
              ? "Change Image" 
              : "Upload Image"
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
