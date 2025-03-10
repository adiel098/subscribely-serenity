
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const SubscriptionSuccessScreen = () => {
  return (
    <div className="py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mx-auto mb-6 p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center"
      >
        <Check className="h-8 w-8 text-green-600" />
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-900">Subscription Activated!</h3>
      <p className="text-gray-600 mt-2">Your platform subscription has been successfully activated.</p>
    </div>
  );
};
