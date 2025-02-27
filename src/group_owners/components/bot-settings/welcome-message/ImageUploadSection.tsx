
import { useState } from "react";
import { toast } from "sonner";
import { optimizeImageForTelegram } from "./utils/imageOptimizer";
import { ImagePreview } from "./components/ImagePreview";
import { UploadButton } from "./components/UploadButton";
import { ImageError } from "./components/ImageError";

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

  const clearImage = () => {
    setWelcomeImage("");
    updateSettings.mutate({ 
      welcome_image: null
    });
    toast.success("Welcome image removed");
  };

  return (
    <div className="space-y-4">
      <ImageError error={imageError} />
      <ImagePreview welcomeImage={welcomeImage} onClear={clearImage} />
      <UploadButton 
        onFileSelected={handleImageUpload}
        isUploading={isUploading}
        hasExistingImage={!!welcomeImage}
      />
    </div>
  );
};
