
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRef } from "react";

interface UploadButtonProps {
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  hasExistingImage: boolean;
}

export const UploadButton = ({ 
  onFileSelected, 
  isUploading, 
  hasExistingImage 
}: UploadButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
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
          : hasExistingImage 
            ? "Change Image" 
            : "Upload Image"
        }
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={onFileSelected}
        disabled={isUploading}
      />
    </div>
  );
};
