
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  welcomeImage: string;
  onClear: () => void;
}

export const ImagePreview = ({ welcomeImage, onClear }: ImagePreviewProps) => {
  if (!welcomeImage) return null;
  
  return (
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
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
