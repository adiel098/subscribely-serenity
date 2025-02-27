
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface MessagePreviewProps {
  message: string;
  signature?: string;
  image?: string | null;
  buttonText?: string;
}

export const MessagePreview = ({ message, signature, image, buttonText }: MessagePreviewProps) => {
  return (
    <Card className="border-slate-200 overflow-hidden max-w-md bg-gray-50">
      <CardContent className="p-0">
        {image && (
          <div className="w-full overflow-hidden flex justify-center bg-gray-100 p-2">
            <img
              src={image}
              alt="Message preview"
              className="max-h-32 object-contain rounded-md"
              style={{ maxWidth: "100%" }}
            />
          </div>
        )}
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {message}
            {signature && (
              <div className="text-xs text-gray-500 mt-2">
                {signature}
              </div>
            )}
          </div>
          
          {buttonText && (
            <div className="mt-2">
              <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                {buttonText}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
