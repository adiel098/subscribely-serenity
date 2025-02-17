
import { Bot, Eye } from "lucide-react";

interface MessagePreviewProps {
  message: string;
  signature: string;
}

export const MessagePreview = ({ message, signature }: MessagePreviewProps) => {
  return (
    <div className="fixed right-4 top-24 w-80">
      <div className="rounded-lg border bg-card text-card-foreground">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Message Preview</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="rounded-lg bg-white/10 backdrop-blur-lg border p-4 space-y-2 font-[system-ui]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-medium text-sm text-primary">Bot</div>
                <div className="text-sm whitespace-pre-wrap">
                  {message}
                  {signature && (
                    <>
                      {"\n\n"}
                      <span className="text-muted-foreground">{signature}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
