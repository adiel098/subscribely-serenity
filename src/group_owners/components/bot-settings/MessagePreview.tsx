
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface MessagePreviewProps {
  message: string;
  signature?: string;
  image?: string | null;
  buttonText?: string;
}

export const MessagePreview = ({ message, signature, image, buttonText }: MessagePreviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-slate-200 overflow-hidden max-w-md bg-slate-50 shadow-sm">
        <CardContent className="p-0">
          {image && (
            <div className="w-full overflow-hidden flex justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-2">
              <motion.img
                src={image}
                alt="Message preview"
                className="max-h-32 object-contain rounded-md shadow-sm"
                style={{ maxWidth: "100%" }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
          <div className="p-4 space-y-4">
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {message}
              {signature && (
                <div className="text-xs text-indigo-500 mt-3 border-t border-gray-100 pt-2">
                  {signature}
                </div>
              )}
            </div>
            
            {buttonText && (
              <div className="mt-3">
                <Button size="sm" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium shadow-sm">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  {buttonText}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
