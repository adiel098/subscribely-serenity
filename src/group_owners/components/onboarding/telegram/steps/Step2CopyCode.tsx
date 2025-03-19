
import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Step2CopyCodeProps {
  verificationCode: string | null;
  isLoading: boolean;
}

const Step2CopyCode: React.FC<Step2CopyCodeProps> = ({ 
  verificationCode, 
  isLoading 
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  
  const copyCodeToClipboard = async () => {
    if (!verificationCode) return;
    
    try {
      await navigator.clipboard.writeText(verificationCode);
      setCopied(true);
      
      toast({
        title: "Code copied!",
        description: "Verification code copied to clipboard"
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
      toast({
        title: "Could not copy code",
        description: "Please copy it manually",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div 
      className="flex flex-col md:flex-row gap-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex-shrink-0 flex items-start">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
          2
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Copy className="h-5 w-5 text-indigo-600" />
          Copy Verification Code
        </h3>
        <p className="mt-2 text-gray-600">
          Copy this verification code and paste it in your Telegram group or channel
        </p>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          <code className="px-6 py-3 bg-indigo-50 rounded-lg text-lg font-mono border border-indigo-100 text-indigo-700 w-full sm:w-auto text-center">
            {verificationCode || "Loading..."}
          </code>
          <Button
            onClick={copyCodeToClipboard}
            className={`${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600'} text-white shadow-md w-full sm:w-auto transition-colors duration-300`}
            disabled={!verificationCode || isLoading}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </>
            )}
          </Button>
        </div>
        <p className="mt-3 text-sm text-gray-500 flex items-center">
          <span className="bg-amber-100 text-amber-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Note</span>
          The message will be automatically deleted once verified
        </p>
      </div>
    </motion.div>
  );
};

export default Step2CopyCode;
