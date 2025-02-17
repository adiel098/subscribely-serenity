import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

interface MessagePreviewProps {
  message: string;
  signature: string;
}

export const MessagePreview = ({ message, signature }: MessagePreviewProps) => {
  const fullMessage = `${message}\n\n${signature}`;

  return (
    <Card className="border-primary/10">
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <Badge variant="secondary">Preview</Badge>
        </div>
        <div className="prose prose-sm prose-stone">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            children={fullMessage} 
          />
        </div>
      </CardContent>
    </Card>
  );
};
