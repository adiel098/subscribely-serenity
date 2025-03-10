
import { motion } from "framer-motion";

export const CryptoPaymentIcon = () => {
  return (
    <motion.div 
      className="relative w-10 h-10 flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }}
    >
      <motion.div 
        className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 opacity-70"
        animate={{ 
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      <motion.div 
        className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white font-bold shadow-lg z-10"
      >
        ₿
      </motion.div>
    </motion.div>
  );
};
