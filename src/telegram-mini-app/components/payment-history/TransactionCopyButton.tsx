
import React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

interface TransactionCopyButtonProps {
  transactionId: string;
}

export const TransactionCopyButton: React.FC<TransactionCopyButtonProps> = ({ transactionId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(transactionId);
    setCopied(true);
    
    toast({
      title: "Copied!",
      description: "Transaction ID copied to clipboard",
      duration: 2000,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="ml-1 p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      aria-label="Copy transaction ID"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
};
