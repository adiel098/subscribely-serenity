
import { Card } from "@/components/ui/card";

interface MessagePreviewProps {
  message: string;
  signature: string;
}

export const MessagePreview = ({ message, signature }: MessagePreviewProps) => {
  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-medium">Message Preview</h3>
      <div className="space-y-2 text-sm">
        <p className="whitespace-pre-wrap">{message}</p>
        <p className="text-muted-foreground">{signature}</p>
      </div>
    </Card>
  );
};
