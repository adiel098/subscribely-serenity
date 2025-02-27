
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

interface MessagePreviewProps {
  message: string;
  signature: string;
  image?: string | null;
}

export const MessagePreview = ({ message, signature, image }: MessagePreviewProps) => {
  const messageWithSignature = `${message}\n\n${signature}`;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Message Preview</div>
      <Card className="border-dashed">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Telegram Bot
          </CardTitle>
          <CardDescription className="text-xs">Preview of the message</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-3">
          {image && (
            <div className="w-full">
              <img 
                src={image} 
                alt="Welcome" 
                className="w-full h-auto max-h-48 object-cover rounded-md" 
              />
            </div>
          )}
          <div className="text-sm whitespace-pre-wrap">{messageWithSignature}</div>
        </CardContent>
      </Card>
    </div>
  );
};
