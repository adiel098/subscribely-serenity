import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpDialogProps {
  show: boolean;
}

export function HelpDialog({ show }: HelpDialogProps) {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 10 }} 
      className="absolute top-16 right-6 bg-white rounded-lg shadow-xl p-4 w-72 border border-blue-100 z-50"
    >
      <h3 className="text-lg font-bold text-blue-700 mb-2 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-blue-500" />
        Need Help?
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        If you need assistance with managing your communities or subscriptions, our support team is here to help.
      </p>
      <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
        Contact Support
      </Button>
    </motion.div>
  );
}
