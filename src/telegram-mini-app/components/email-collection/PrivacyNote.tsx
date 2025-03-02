
import React from "react";
import { motion } from "framer-motion";

export const PrivacyNote: React.FC = () => {
  return (
    <motion.p 
      className="text-xs text-center text-gray-500 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      We'll only use your email to send important updates about your membership 📬
    </motion.p>
  );
};
